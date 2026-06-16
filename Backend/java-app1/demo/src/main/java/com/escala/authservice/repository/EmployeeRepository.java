package com.escala.authservice.repository;

import com.escala.authservice.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByActiveTrueOrderByFullNameAsc();
    List<Employee> findByActiveTrueAndProjectIdOrderByFullNameAsc(Long projectId);
    List<Employee> findByActiveTrueAndSectorIdOrderByFullNameAsc(Long sectorId);
    List<Employee> findByActiveTrueAndCompanyIdOrderByFullNameAsc(Long companyId);
    long countByActiveTrue();
    long countByActiveTrueAndCompanyId(Long companyId);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUserEmail(String email);
    Optional<Employee> findByEmailAndCompanySlug(String email, String companySlug);
    Optional<Employee> findByUserEmailAndCompanySlug(String email, String companySlug);
    List<Employee> findByCompanyId(Long companyId);
}
