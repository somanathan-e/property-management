package com.eba.opportunity.mappers;

import com.eba.opportunity.dto.OpportunityDto;
import com.eba.opportunity.dto.OpportunityUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface OpportunityMapper {
    List<OpportunityDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search);
    OpportunityDto findById(Long id);
    OpportunityDto findByCode(String opportunityCode);
    void insert(OpportunityUpsertDto request);
    int update(@Param("id") Long id, @Param("request") OpportunityUpsertDto request);
    int softDelete(Long id);
}

