package com.escala.authservice.service;

import com.escala.authservice.dto.rebac.*;
import com.escala.authservice.entity.*;
import com.escala.authservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RebacAdminService {
    private final UserRepository userRepository;
    private final ManagerAssignmentRepository managerAssignmentRepository;
    private final ManagementEdgeRepository managementEdgeRepository;
    private final ManagementClosureRepository managementClosureRepository;
    private final PolicyService policyService;
    private final AuditLogService auditLogService;

    public List<ManagerAssignmentResponse> listAssignments(String requesterEmail) {
        User requester = requireOwnerOrAdmin(requesterEmail);
        return managerAssignmentRepository.findByCompanyIdOrderByManagerUsernameAscScopeTypeAscScopeIdAsc(requester.getCompany().getId())
                .stream()
                .map(ManagerAssignmentResponse::from)
                .toList();
    }

    public void requireAdminCatalogAccess(String requesterEmail) {
        requireOwnerOrAdmin(requesterEmail);
    }

    @Transactional
    public ManagerAssignmentResponse createAssignment(String requesterEmail, ManagerAssignmentRequest request) {
        User requester = requireOwnerOrAdmin(requesterEmail);
        User manager = requireCompanyUser(requester, request.getManagerUserId());
        ManagerRoleLevel roleLevel = request.getRoleLevel() == null ? inferRoleLevel(manager) : request.getRoleLevel();

        ManagerAssignment assignment = ManagerAssignment.builder()
                .company(requester.getCompany())
                .manager(manager)
                .scopeType(Objects.requireNonNull(request.getScopeType(), "scopeType obrigatorio"))
                .scopeId(Objects.requireNonNull(request.getScopeId(), "scopeId obrigatorio"))
                .roleLevel(roleLevel)
                .levelWeight(roleLevel.getWeight())
                .startsAt(request.getStartsAt())
                .endsAt(request.getEndsAt())
                .active(request.getActive() == null || request.getActive())
                .build();

        ManagerAssignment saved = managerAssignmentRepository.save(assignment);
        auditLogService.record(requesterEmail, "REBAC_MANAGER_ASSIGNMENT_CREATED", "ManagerAssignment", saved.getId(),
                "manager=" + manager.getEmail() + "; scope=" + saved.getScopeType() + ":" + saved.getScopeId());
        return ManagerAssignmentResponse.from(saved);
    }

    @Transactional
    public void deleteAssignment(String requesterEmail, UUID id) {
        User requester = requireOwnerOrAdmin(requesterEmail);
        ManagerAssignment assignment = managerAssignmentRepository.findById(id).orElseThrow();
        requireSameCompany(requester, assignment.getCompany());
        managerAssignmentRepository.delete(assignment);
        auditLogService.record(requesterEmail, "REBAC_MANAGER_ASSIGNMENT_DELETED", "ManagerAssignment", id, "assignment removido");
    }

    public List<ManagementEdgeResponse> listEdges(String requesterEmail) {
        User requester = requireOwnerOrAdmin(requesterEmail);
        return managementEdgeRepository.findByCompanyIdOrderByParentUsernameAscChildUsernameAsc(requester.getCompany().getId())
                .stream()
                .map(ManagementEdgeResponse::from)
                .toList();
    }

    @Transactional
    public ManagementEdgeResponse createEdge(String requesterEmail, ManagementEdgeRequest request) {
        User requester = requireOwnerOrAdmin(requesterEmail);
        User parent = requireCompanyUser(requester, request.getParentUserId());
        User child = requireCompanyUser(requester, request.getChildUserId());

        if (Objects.equals(parent.getId(), child.getId())) {
            throw new IllegalArgumentException("Gestor e subordinado devem ser usuarios diferentes");
        }

        ManagementEdge edge = ManagementEdge.builder()
                .company(requester.getCompany())
                .parent(parent)
                .child(child)
                .relationType(request.getRelationType() == null || request.getRelationType().isBlank() ? "REPORTS_TO" : request.getRelationType())
                .startsAt(request.getStartsAt())
                .endsAt(request.getEndsAt())
                .active(request.getActive() == null || request.getActive())
                .build();

        ManagementEdge saved = managementEdgeRepository.save(edge);
        auditLogService.record(requesterEmail, "REBAC_MANAGEMENT_EDGE_CREATED", "ManagementEdge", saved.getId(),
                parent.getEmail() + " -> " + child.getEmail());
        return ManagementEdgeResponse.from(saved);
    }

    @Transactional
    public void deleteEdge(String requesterEmail, UUID id) {
        User requester = requireOwnerOrAdmin(requesterEmail);
        ManagementEdge edge = managementEdgeRepository.findById(id).orElseThrow();
        requireSameCompany(requester, edge.getCompany());
        managementEdgeRepository.delete(edge);
        auditLogService.record(requesterEmail, "REBAC_MANAGEMENT_EDGE_DELETED", "ManagementEdge", id, "edge removida");
    }

    public List<ManagementClosureResponse> listClosure(String requesterEmail) {
        User requester = requireOwnerOrAdmin(requesterEmail);
        return managementClosureRepository.findByCompanyIdOrderByAncestorUsernameAscDepthAscDescendantUsernameAsc(requester.getCompany().getId())
                .stream()
                .map(ManagementClosureResponse::from)
                .toList();
    }

    @Transactional
    public List<ManagementClosureResponse> recalculateClosure(String requesterEmail) {
        User requester = requireOwnerOrAdmin(requesterEmail);
        UUID companyId = requester.getCompany().getId();
        List<User> users = userRepository.findByCompanyId(companyId);
        List<ManagementEdge> edges = managementEdgeRepository.findByCompanyIdAndActiveTrue(companyId);

        Map<UUID, User> userById = new HashMap<>();
        for (User user : users) {
            userById.put(user.getId(), user);
        }

        Map<UUID, List<UUID>> childrenByParent = new HashMap<>();
        for (ManagementEdge edge : edges) {
            childrenByParent.computeIfAbsent(edge.getParent().getId(), ignored -> new ArrayList<>()).add(edge.getChild().getId());
        }

        managementClosureRepository.deleteByCompanyId(companyId);

        List<ManagementClosure> closures = new ArrayList<>();
        for (User ancestor : users) {
            closures.add(buildClosure(requester.getCompany(), ancestor, ancestor, 0));
            Deque<PathNode> stack = new ArrayDeque<>();
            for (UUID childId : childrenByParent.getOrDefault(ancestor.getId(), List.of())) {
                stack.push(new PathNode(childId, 1));
            }

            Set<UUID> visited = new HashSet<>();
            while (!stack.isEmpty()) {
                PathNode node = stack.pop();
                if (!visited.add(node.userId())) continue;
                User descendant = userById.get(node.userId());
                if (descendant == null) continue;
                closures.add(buildClosure(requester.getCompany(), ancestor, descendant, node.depth()));
                for (UUID childId : childrenByParent.getOrDefault(node.userId(), List.of())) {
                    stack.push(new PathNode(childId, node.depth() + 1));
                }
            }
        }

        List<ManagementClosure> saved = managementClosureRepository.saveAll(closures);
        auditLogService.record(requesterEmail, "REBAC_MANAGEMENT_CLOSURE_RECALCULATED", "ManagementClosure", companyId,
                "paths=" + saved.size());
        return saved.stream().map(ManagementClosureResponse::from).toList();
    }

    private ManagementClosure buildClosure(Company company, User ancestor, User descendant, int depth) {
        return ManagementClosure.builder()
                .company(company)
                .ancestor(ancestor)
                .descendant(descendant)
                .depth(depth)
                .maxWeightPath(policyService.highestWeight(ancestor))
                .build();
    }

    private User requireOwnerOrAdmin(String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        if (!policyService.isOwnerOrAdmin(requester)) {
            throw new AccessDeniedException("Apenas OWNER ou ADMIN podem administrar ReBAC");
        }
        return requester;
    }

    private User requireCompanyUser(User requester, UUID userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "userId obrigatorio")).orElseThrow();
        requireSameCompany(requester, user.getCompany());
        return user;
    }

    private void requireSameCompany(User requester, Company targetCompany) {
        if (requester.getCompany() == null || targetCompany == null || !Objects.equals(requester.getCompany().getId(), targetCompany.getId())) {
            throw new AccessDeniedException("Recurso nao pertence a sua empresa");
        }
    }

    private ManagerRoleLevel inferRoleLevel(User manager) {
        return manager.getRoles().stream()
                .map(Role::getName)
                .map(role -> {
                    try {
                        return ManagerRoleLevel.valueOf(role);
                    } catch (IllegalArgumentException ignored) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .max(Comparator.comparingInt(ManagerRoleLevel::getWeight))
                .orElse(ManagerRoleLevel.MANAGER_SUPERVISOR);
    }

    private record PathNode(UUID userId, int depth) {}
}
