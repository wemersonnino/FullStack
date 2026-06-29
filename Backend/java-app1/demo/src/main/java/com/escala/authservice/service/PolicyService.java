package com.escala.authservice.service;

import com.escala.authservice.entity.*;
import com.escala.authservice.repository.ManagementClosureRepository;
import com.escala.authservice.repository.ManagerAssignmentRepository;
import com.escala.authservice.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PolicyService {
    private final ManagerAssignmentRepository managerAssignmentRepository;
    private final ManagementClosureRepository managementClosureRepository;
    private final SectorRepository sectorRepository;

    public boolean isOwnerOrAdmin(User user) {
        Set<Role> roles = user.getRoles();
        return roles != null && roles.stream()
                .map(Role::getName)
                .anyMatch(role -> role.equals("OWNER") || role.equals("ADMIN") || role.equals("SYSTEM_ADMIN"));
    }

    public boolean isSystemAdmin(User user) {
        Set<Role> roles = user.getRoles();
        return roles != null && roles.stream()
                .map(Role::getName)
                .anyMatch(role -> role.equals("SYSTEM_ADMIN"));
    }

    public boolean isOwner(User user) {
        Set<Role> roles = user.getRoles();
        return roles != null && roles.stream()
                .map(Role::getName)
                .anyMatch(role -> role.equals("OWNER") || role.equals("SYSTEM_ADMIN"));
    }

    public boolean isManager(User user) {
        Set<Role> roles = user.getRoles();
        return roles != null && roles.stream()
                .map(Role::getName)
                .anyMatch(role -> role.equals("MANAGER") || role.startsWith("MANAGER_"));
    }

    public boolean canManageSchedules(User user) {
        return isOwnerOrAdmin(user) || isManager(user);
    }

    public boolean isScopedManagerOnly(User user) {
        return isManager(user) && !isOwnerOrAdmin(user);
    }

    public int highestWeight(User user) {
        if (user.getRoles() == null) return 0;
        return user.getRoles().stream()
                .map(Role::getName)
                .mapToInt(ManagerRoleLevel::weightOf)
                .max()
                .orElse(0);
    }

    public List<UUID> managedSectorIds(User user) {
        UUID companyId = user.getCompany().getId();
        UUID userId = user.getId();
        List<UUID> explicit = managerAssignmentRepository
                .findByCompanyIdAndManagerIdAndActiveTrue(companyId, userId)
                .stream()
                .filter(assignment -> assignment.getScopeType() == ManagerScopeType.SECTOR)
                .map(ManagerAssignment::getScopeId)
                .distinct()
                .toList();

        if (!explicit.isEmpty()) {
            return explicit;
        }

        return sectorRepository.findByCompanyIdAndManagerEmail(companyId, user.getEmail())
                .stream()
                .map(Sector::getId)
                .toList();
    }

    public void requireCanManageSchedules(User user) {
        if (!canManageSchedules(user)) {
            throw new AccessDeniedException("Usuario sem permissao para gerir escalas");
        }
    }

    public void requireOwnerOrAdmin(User user, String message) {
        if (!isOwnerOrAdmin(user)) {
            throw new AccessDeniedException(message);
        }
    }

    public void requireOwner(User user, String message) {
        if (!isOwner(user)) {
            throw new AccessDeniedException(message);
        }
    }

    public void requireCanAccessEmployee(User user, Employee employee) {
        boolean isSystemAdmin = user.getRoles() != null && user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(role -> role.equals("SYSTEM_ADMIN"));
        
        if (!isSystemAdmin && !sameCompany(user, employee)) {
            throw new AccessDeniedException("Funcionario nao pertence a sua empresa");
        }
        if (isSystemAdmin) return;
        if (!isScopedManagerOnly(user)) return;
        if (employee.getSector() != null && managedSectorIds(user).contains(employee.getSector().getId())) return;
        if (employee.getUser() != null && managementClosureRepository.existsByCompanyIdAndAncestorIdAndDescendantId(
                user.getCompany().getId(), user.getId(), employee.getUser().getId())) return;
        throw new AccessDeniedException("Nao autorizado a gerir este funcionario");
    }

    public void requireCanAccessSector(User user, UUID sectorId) {
        if (sectorId == null || !isScopedManagerOnly(user)) return;
        if (!managedSectorIds(user).contains(sectorId)) {
            throw new AccessDeniedException("Nao autorizado a gerir este setor");
        }
    }

    public void requireCanAccessShift(User user, WorkShift shift) {
        boolean isSystemAdmin = user.getRoles() != null && user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(role -> role.equals("SYSTEM_ADMIN"));
        
        if (!isSystemAdmin && !Objects.equals(shift.getEmployee().getCompany().getId(), user.getCompany().getId())) {
            throw new AccessDeniedException("Escala nao pertence a sua empresa");
        }
        requireCanAccessEmployee(user, shift.getEmployee());
    }

    private boolean sameCompany(User user, Employee employee) {
        return user.getCompany() != null
                && employee.getCompany() != null
                && Objects.equals(user.getCompany().getId(), employee.getCompany().getId());
    }
}
