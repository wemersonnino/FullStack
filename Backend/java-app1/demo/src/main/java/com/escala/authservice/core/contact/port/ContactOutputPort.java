package com.escala.authservice.core.contact.port;

import com.escala.authservice.core.contact.domain.ContactMessage;

public interface ContactOutputPort {
    void save(ContactMessage message);
    void sendEmail(ContactMessage message);
}
