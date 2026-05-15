package com.eba.customer.service;

import com.eba.common.dto.PagedResult;
import com.eba.customer.dto.CustomerDto;
import com.eba.customer.dto.CustomerUpsertDto;

public interface CustomerService {
    PagedResult<CustomerDto> getCustomers(String search, Integer page, Integer size);

    CustomerDto getCustomer(Long id);

    CustomerDto createCustomer(CustomerUpsertDto request);

    CustomerDto updateCustomer(Long id, CustomerUpsertDto request);

    void deleteCustomer(Long id);
}
