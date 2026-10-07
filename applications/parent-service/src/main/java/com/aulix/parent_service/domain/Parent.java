package com.aulix.parent_service.domain;

import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

@Entity
@Table(name = "parent", uniqueConstraints = {
        @UniqueConstraint(columnNames = "user_id")
})
public class Parent extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "phone", length = 30)
    private String phone;

    protected Parent() {}

    public Parent(UUID userId, String phone) {
        this.userId = userId;
        this.phone = phone;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
