package com.eba.customer.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.customer.dto.CustomerDto;
import com.eba.customer.dto.CustomerUpsertDto;
import com.eba.customer.mappers.CustomerMapper;
import com.eba.customer.service.CustomerService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class CustomerServiceImpl implements CustomerService {

    @Override
    public PagedResult<CustomerDto> getCustomers(String search, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            CustomerMapper mapper = session.getMapper(CustomerMapper.class);
            return new PagedResult<>(
                mapper.findPage(query.search(), query.size(), query.offset()),
                query.page(),
                query.size(),
                mapper.count(query.search())
            );
        }
    }

    @Override
    public CustomerDto getCustomer(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            CustomerDto customer = session.getMapper(CustomerMapper.class).findById(id);
            if (customer == null) {
                throw new AppException(Response.Status.NOT_FOUND, "Customer not found");
            }
            return customer;
        }
    }

    @Override
    public CustomerDto createCustomer(CustomerUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            CustomerMapper mapper = session.getMapper(CustomerMapper.class);
            mapper.insert(request);
            return mapper.findByCode(request.customerCode());
        }
    }

    @Override
    public CustomerDto updateCustomer(Long id, CustomerUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            CustomerMapper mapper = session.getMapper(CustomerMapper.class);
            if (mapper.update(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Customer not found");
            }
            return mapper.findById(id);
        }
    }

    @Override
    public void deleteCustomer(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            if (session.getMapper(CustomerMapper.class).softDelete(id) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Customer not found");
            }
        }
    }

    private void validate(CustomerUpsertDto request) {
        if (request == null || request.customerCode() == null || request.customerCode().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Customer code is required");
        }
        if (request.customerName() == null || request.customerName().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Customer name is required");
        }
        if (request.category() == null || request.category().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Category is required");
        }
        if (request.status() == null || request.status().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Status is required");
        }
    }
}
