package com.eba.contact.service;

import com.eba.common.dto.PagedResult;
import com.eba.contact.dto.ContactDto;
import com.eba.contact.dto.ContactUpsertDto;

public interface ContactService {
    PagedResult<ContactDto> getContacts(String search, Integer page, Integer size);
    ContactDto getContact(Long id);
    ContactDto createContact(ContactUpsertDto request);
    ContactDto updateContact(Long id, ContactUpsertDto request);
    void deleteContact(Long id);
}

