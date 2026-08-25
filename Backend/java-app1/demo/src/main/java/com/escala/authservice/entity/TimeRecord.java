package com.escala.authservice.entity;

import com.escala.authservice.entity.support.AppendOnlyEntityListener;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@org.hibernate.annotations.Filter(name = "tenantFilter", condition = "company_id = :tenantId")
@EntityListeners(AppendOnlyEntityListener.class)
@Table(
        name = "time_records",
        indexes = {
                @Index(name = "idx_time_records_user_time", columnList = "user_id, recordTime"),
                @Index(name = "idx_time_records_type_time", columnList = "type, recordTime"),
                @Index(name = "idx_time_records_company_user_time", columnList = "company_id, user_id, recordTime DESC")
        }
)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class TimeRecord {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false, updatable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false, updatable = false)
    private Company company;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime recordTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private TimeRecordType type;

    @Column(updatable = false)
    private String ipAddress;
    @Column(updatable = false)
    private Double latitude;
    @Column(updatable = false)
    private Double longitude;
    @Column(updatable = false)
    private String deviceFingerprint;
}
