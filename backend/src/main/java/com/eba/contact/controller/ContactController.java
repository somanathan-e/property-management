package com.eba.contact.controller;

import com.eba.common.config.ServiceRegistry;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.contact.dto.ContactDto;
import com.eba.contact.dto.ContactUpsertDto;
import com.eba.contact.service.ContactService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/contacts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContactController {
    private final ContactService contactService;
    public ContactController() { this(ServiceRegistry.CONTACT_SERVICE); }
    public ContactController(ContactService contactService) { this.contactService = contactService; }
    @GET public ApiResponse<PagedResult<ContactDto>> getContacts(@QueryParam("q") String search, @QueryParam("page") Integer page, @QueryParam("size") Integer size) { return ApiResponse.success("Contacts fetched", contactService.getContacts(search, page, size)); }
    @GET @Path("/{id}") public ApiResponse<ContactDto> getContact(@PathParam("id") Long id) { return ApiResponse.success("Contact fetched", contactService.getContact(id)); }
    @POST public ApiResponse<ContactDto> createContact(ContactUpsertDto request) { return ApiResponse.success("Contact created", contactService.createContact(request)); }
    @PUT @Path("/{id}") public ApiResponse<ContactDto> updateContact(@PathParam("id") Long id, ContactUpsertDto request) { return ApiResponse.success("Contact updated", contactService.updateContact(id, request)); }
    @DELETE @Path("/{id}") public ApiResponse<Void> deleteContact(@PathParam("id") Long id) { contactService.deleteContact(id); return ApiResponse.success("Contact deleted", null); }
}

