package com.escala.authservice.repository;

import com.escala.authservice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCompanyId(Long companyId);
    Invoice findByStripeInvoiceId(String stripeInvoiceId);
}
