package com.escala.authservice.repository;

import com.escala.authservice.entity.Sector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectorRepository extends JpaRepository<Sector, Long> {
    List<Sector> findByCompanyId(Long companyId);
    List<Sector> findByManagerEmail(String email);
    List<Sector> findByCompanyIdAndManagerEmail(Long companyId, String email);
}
