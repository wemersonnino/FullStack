package com.escala.authservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "time_records",
        indexes = {
                @Index(name = "idx_time_records_user_time", columnList = "user_id, recordTime"),
                @Index(name = "idx_time_records_type_time", columnList = "type, recordTime"),
                @Index(name = "idx_time_records_company_user_time", columnList = "company_id, user_id, recordTime DESC")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeRecord {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private Company company;

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
