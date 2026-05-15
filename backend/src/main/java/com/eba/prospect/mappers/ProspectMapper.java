package com.eba.prospect.mappers;

import com.eba.prospect.dto.ProspectDto;
import com.eba.prospect.dto.ProspectUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface ProspectMapper {
    List<ProspectDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search);
    ProspectDto findById(Long id);
    ProspectDto findByCode(String prospectCode);
    void insert(ProspectUpsertDto request);
    int update(@Param("id") Long id, @Param("request") ProspectUpsertDto request);
    int softDelete(Long id);
}

