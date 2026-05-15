package com.eba.customer.mappers;

import com.eba.customer.dto.CustomerDto;
import com.eba.customer.dto.CustomerUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface CustomerMapper {
    List<CustomerDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);

    long count(@Param("search") String search);

    CustomerDto findById(Long id);

    CustomerDto findByCode(String customerCode);

    void insert(CustomerUpsertDto request);

    int update(@Param("id") Long id, @Param("request") CustomerUpsertDto request);

    int softDelete(Long id);
}
