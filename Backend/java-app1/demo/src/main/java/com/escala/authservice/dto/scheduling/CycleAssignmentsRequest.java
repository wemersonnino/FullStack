package com.escala.authservice.dto.scheduling;

import java.util.List;

public record CycleAssignmentsRequest(
        List<CycleAssignmentItemRequest> assignments
) {
}
