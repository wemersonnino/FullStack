package com.escala.authservice.entity;

import com.escala.authservice.scheduling.domain.monthly.HolidayType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "schedule_holidays",
        indexes = {
                @Index(name = "idx_schedule_holidays_company_date", columnList = "company_id, holidayDate"),
                @Index(name = "idx_schedule_holidays_company_unit_date", columnList = "company_id, unitId, holidayDate")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleHoliday {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @ManyToOne(optional = false)
    private Company company;

    private UUID unitId;

    @Column(nullable = false)
    private LocalDate holidayDate;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HolidayType type;

    @Version
    private Long version;

    @PrePersist
    void prePersist() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }
}
