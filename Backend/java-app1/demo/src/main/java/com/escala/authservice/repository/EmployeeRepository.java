package com.escala.authservice.repository;

import com.escala.authservice.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    List<Employee> findByActiveTrueOrderByFullNameAsc();
    List<Employee> findByActiveTrueAndProjectIdOrderByFullNameAsc(UUID projectId);
    List<Employee> findByActiveTrueAndSectorIdOrderByFullNameAsc(UUID sectorId);
    List<Employee> findByActiveTrueAndCompanyIdOrderByFullNameAsc(UUID companyId);
    @Query("""
            select e
            from Employee e
            where e.active = true
              and e.company.id = :companyId
              and (:projectId is null or e.project.id = :projectId)
              and (:sectorId is null or e.sector.id = :sectorId)
              and (
                    :query is null
                    or lower(e.fullName) like concat('%', :query, '%')
                    or lower(e.email) like concat('%', :query, '%')
                  )
            order by e.fullName asc
            """)
    List<Employee> findSchedulableEmployees(
            @Param("companyId") UUID companyId,
            @Param("projectId") UUID projectId,
            @Param("sectorId") UUID sectorId,
            @Param("query") String query
    );

    long countByActiveTrue();
    long countByActiveTrueAndCompanyId(UUID companyId);
    boolean existsByCompanyIdAndEmailIgnoreCase(UUID companyId, String email);
    boolean existsByCompanyIdAndEmailIgnoreCaseAndIdNot(UUID companyId, String email, UUID id);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUserEmail(String email);
    Optional<Employee> findByEmailAndCompanySlug(String email, String companySlug);
    Optional<Employee> findByUserEmailAndCompanySlug(String email, String companySlug);
    List<Employee> findByCompanyId(UUID companyId);
    org.springframework.data.domain.Page<Employee> findByCompanyId(UUID companyId, org.springframework.data.domain.Pageable pageable);
    List<Employee> findByIdInAndActiveTrueAndCompanyId(List<UUID> ids, UUID companyId);
    Optional<Employee> findByPublicIdAndCompanyId(UUID publicId, UUID companyId);
    long countBySectorIdAndCompanyId(UUID sectorId, UUID companyId);
    long countByProjectIdAndCompanyId(UUID projectId, UUID companyId);
}
