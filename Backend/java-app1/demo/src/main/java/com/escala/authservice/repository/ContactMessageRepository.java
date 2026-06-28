package com.escala.authservice.repository;

import java.util.UUID;

import com.escala.authservice.entity.ContactMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, UUID> {
}
