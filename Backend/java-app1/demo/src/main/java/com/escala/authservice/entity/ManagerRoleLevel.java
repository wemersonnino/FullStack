package com.escala.authservice.entity;

public enum ManagerRoleLevel {
    OWNER(10_000),
    ADMIN(5_000),
    MANAGER_DIRETOR(1_000),
    MANAGER_GERENTE(100),
    MANAGER_COORDENADOR(50),
    MANAGER_SUPERVISOR(10);

    private final int weight;

    ManagerRoleLevel(int weight) {
        this.weight = weight;
    }

    public int getWeight() {
        return weight;
    }

    public static int weightOf(String roleName) {
        if (roleName == null) return 0;
        try {
            return ManagerRoleLevel.valueOf(roleName).getWeight();
        } catch (IllegalArgumentException ignored) {
            return "MANAGER".equals(roleName) ? MANAGER_SUPERVISOR.getWeight() : 0;
        }
    }
}
