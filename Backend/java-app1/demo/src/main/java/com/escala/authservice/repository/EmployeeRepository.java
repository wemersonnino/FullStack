package com.escala.authservice.repository;

import com.escala.authservice.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByActiveTrueOrderByFullNameAsc();
    List<Employee> findByActiveTrueAndProjectIdOrderByFullNameAsc(Long projectId);
    List<Employee> findByActiveTrueAndSectorIdOrderByFullNameAsc(Long sectorId);
    List<Employee> findByActiveTrueAndCompanyIdOrderByFullNameAsc(Long companyId);
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
            @Param("companyId") Long companyId,
            @Param("projectId") Long projectId,
            @Param("sectorId") Long sectorId,
            @Param("query") String query
    );

    long countByActiveTrue();
    long countByActiveTrueAndCompanyId(Long companyId);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUserEmail(String email);
    Optional<Employee> findByEmailAndCompanySlug(String email, String companySlug);
    Optional<Employee> findByUserEmailAndCompanySlug(String email, String companySlug);
    List<Employee> findByCompanyId(Long companyId);
    List<Employee> findByIdInAndActiveTrueAndCompanyId(List<Long> ids, Long companyId);
    Optional<Employee> findByPublicIdAndCompanyId(UUID publicId, Long companyId);
}
