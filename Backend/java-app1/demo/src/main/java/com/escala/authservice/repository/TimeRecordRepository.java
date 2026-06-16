package com.escala.authservice.repository;

import com.escala.authservice.entity.TimeRecord;
import com.escala.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.OffsetDateTime;
import java.util.List;

public interface TimeRecordRepository extends JpaRepository<TimeRecord, Long> {
    List<TimeRecord> findByUserOrderByRecordTimeDesc(User user);
    List<TimeRecord> findByUserAndRecordTimeBetweenOrderByRecordTimeAsc(User user, OffsetDateTime start, OffsetDateTime end);
}
