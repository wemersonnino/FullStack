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
@Table(name = "companies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String cnpj; // Suporta Alfanumérico
    private String logoUrl;

    // Geofencing Fields
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Integer allowedRadius = 200; // Raio padrão de 200 metros

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "address_id")
    private Address addressEntity;

    public String getAddress() {
        return addressEntity != null ? addressEntity.getAddressLine() : null;
    }
    public void setAddress(String address) {
        ensureAddressEntity().setAddressLine(address);
    }

    public String getCep() {
        return addressEntity != null ? addressEntity.getCep() : null;
    }
    public void setCep(String cep) {
        ensureAddressEntity().setCep(cep);
    }

    public String getStreet() {
        return addressEntity != null ? addressEntity.getStreet() : null;
    }
    public void setStreet(String street) {
        ensureAddressEntity().setStreet(street);
    }

    public String getNumber() {
        return addressEntity != null ? addressEntity.getNumber() : null;
    }
    public void setNumber(String number) {
        ensureAddressEntity().setNumber(number);
    }

    public String getComplement() {
        return addressEntity != null ? addressEntity.getComplement() : null;
    }
    public void setComplement(String complement) {
        ensureAddressEntity().setComplement(complement);
    }

    public String getNeighborhood() {
        return addressEntity != null ? addressEntity.getNeighborhood() : null;
    }
    public void setNeighborhood(String neighborhood) {
        ensureAddressEntity().setNeighborhood(neighborhood);
    }

    public String getCity() {
        return addressEntity != null ? addressEntity.getCity() : null;
    }
    public void setCity(String city) {
        ensureAddressEntity().setCity(city);
    }

    public String getState() {
        return addressEntity != null ? addressEntity.getState() : null;
    }
    public void setState(String state) {
        ensureAddressEntity().setState(state);
    }

    private Address ensureAddressEntity() {
        if (addressEntity == null) {
            addressEntity = new Address();
        }
        return addressEntity;
    }

    @Builder.Default
    private String theme = "system";

    @Builder.Default
    private boolean active = true;

    // SaaS Provisioning Fields
    @Builder.Default
    private String planType = "FREE";

    private OffsetDateTime trialExpiresAt;
}
