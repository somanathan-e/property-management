package com.eba.tenant.dto;

public record TenantDto(
    Long id,
    String tenantCode,
    String tenantName,
    String status
) {
}

