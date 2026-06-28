package com.escala.authservice.repository;

import com.escala.authservice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByCompanyId(UUID companyId);
    Invoice findByStripeInvoiceId(String stripeInvoiceId);
}
