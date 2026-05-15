package com.eba.tenant.dto;

public record TenantUpsertDto(
    String tenantCode,
    String tenantName,
    String status
) {
}
