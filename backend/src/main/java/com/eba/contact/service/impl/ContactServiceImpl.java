package com.eba.contact.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.contact.dto.ContactDto;
import com.eba.contact.dto.ContactUpsertDto;
import com.eba.contact.mappers.ContactMapper;
import com.eba.contact.service.ContactService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class ContactServiceImpl implements ContactService {
    @Override
    public PagedResult<ContactDto> getContacts(String search, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            ContactMapper mapper = session.getMapper(ContactMapper.class);
            return new PagedResult<>(mapper.findPage(query.search(), query.size(), query.offset()), query.page(), query.size(), mapper.count(query.search()));
        }
    }
    @Override public ContactDto getContact(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) { ContactDto item = session.getMapper(ContactMapper.class).findById(id); if (item == null) throw new AppException(Response.Status.NOT_FOUND, "Contact not found"); return item; } }
    @Override public ContactDto createContact(ContactUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { ContactMapper mapper = session.getMapper(ContactMapper.class); mapper.insert(request); return mapper.findByCode(request.contactCode()); } }
    @Override public ContactDto updateContact(Long id, ContactUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { ContactMapper mapper = session.getMapper(ContactMapper.class); if (mapper.update(id, request) == 0) throw new AppException(Response.Status.NOT_FOUND, "Contact not found"); return mapper.findById(id); } }
    @Override public void deleteContact(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { if (session.getMapper(ContactMapper.class).softDelete(id) == 0) throw new AppException(Response.Status.NOT_FOUND, "Contact not found"); } }
    private void validate(ContactUpsertDto request) { if (request == null || request.customerId() == null) throw new AppException(Response.Status.BAD_REQUEST, "Customer is required"); if (request.contactCode() == null || request.contactCode().isBlank() || request.fullName() == null || request.fullName().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Contact code and full name are required"); if (request.roleTitle() == null || request.roleTitle().isBlank() || request.status() == null || request.status().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Role title and status are required"); }
}

