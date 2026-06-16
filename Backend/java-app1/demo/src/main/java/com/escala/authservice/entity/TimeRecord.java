package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Entity
@Table(name = "time_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @Column(nullable = false)
    private OffsetDateTime recordTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeRecordType type;

    private String ipAddress;
    private Double latitude;
    private Double longitude;
    private String deviceFingerprint;
}
