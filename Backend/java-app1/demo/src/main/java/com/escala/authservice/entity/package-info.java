@org.hibernate.annotations.FilterDef(
        name = "tenantFilter",
        parameters = @org.hibernate.annotations.ParamDef(name = "tenantId", type = java.util.UUID.class),
        applyToLoadByKey = true
)
package com.escala.authservice.entity;
