package com.escala.authservice.repository;

import com.escala.authservice.entity.Sector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SectorRepository extends JpaRepository<Sector, UUID> {
    List<Sector> findByCompanyId(UUID companyId);
    List<Sector> findByManagerEmail(String email);
    List<Sector> findByCompanyIdAndManagerEmail(UUID companyId, String email);
}
