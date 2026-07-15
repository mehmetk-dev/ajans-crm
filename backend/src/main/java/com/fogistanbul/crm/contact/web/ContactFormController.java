package com.fogistanbul.crm.contact.web;

import com.fogistanbul.crm.contact.application.ContactFormService;
import com.fogistanbul.crm.contact.dto.ContactFormRequest;
import com.fogistanbul.crm.contact.dto.ContactFormResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactFormController {

    private final ContactFormService contactFormService;

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ContactFormResponse submit(
            @Valid @RequestBody ContactFormRequest request,
            HttpServletRequest httpRequest
    ) {
        contactFormService.submit(request, clientIp(httpRequest));
        return new ContactFormResponse("Mesajınız ulaştı");
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
