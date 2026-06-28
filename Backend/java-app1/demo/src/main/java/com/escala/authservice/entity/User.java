package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_company_email", columnNames = {"company_id", "email"}),
        @UniqueConstraint(name = "uk_user_company_username", columnNames = {"company_id", "username"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    @Builder.Default
    private String theme = "system";

    private String avatarUrl;

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
    private String position;
    private String function;

    @Builder.Default
    private boolean active = true;

    @ManyToOne
    private Company company;
}
