package com.aulix.auth_service.domain;

import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "permissions", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Permission extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    protected Permission() {}

    public Permission(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {return name;}

    public String getDescription() {return description;}
}
