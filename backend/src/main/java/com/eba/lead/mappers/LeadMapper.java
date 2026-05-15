package com.eba.lead.mappers;

import com.eba.lead.dto.LeadDto;
import com.eba.lead.dto.LeadUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface LeadMapper {
    List<LeadDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search);
    LeadDto findById(Long id);
    LeadDto findByCode(String leadCode);
    void insert(LeadUpsertDto request);
    int update(@Param("id") Long id, @Param("request") LeadUpsertDto request);
    int softDelete(Long id);
}

