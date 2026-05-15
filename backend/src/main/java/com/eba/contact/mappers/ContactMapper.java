package com.eba.contact.mappers;

import com.eba.contact.dto.ContactDto;
import com.eba.contact.dto.ContactUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface ContactMapper {
    List<ContactDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search);
    ContactDto findById(Long id);
    ContactDto findByCode(String contactCode);
    void insert(ContactUpsertDto request);
    int update(@Param("id") Long id, @Param("request") ContactUpsertDto request);
    int softDelete(Long id);
}

