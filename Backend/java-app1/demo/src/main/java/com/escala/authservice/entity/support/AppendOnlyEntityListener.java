package com.escala.authservice.entity.support;

import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

public class AppendOnlyEntityListener {

    @PreUpdate
    public void blockUpdate(Object entity) {
        throw new IllegalStateException(entity.getClass().getSimpleName() + " is append-only and cannot be updated");
    }

    @PreRemove
    public void blockDelete(Object entity) {
        throw new IllegalStateException(entity.getClass().getSimpleName() + " is append-only and cannot be deleted");
    }
}
