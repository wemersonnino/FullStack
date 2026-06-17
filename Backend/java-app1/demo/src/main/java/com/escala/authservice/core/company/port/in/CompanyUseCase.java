package com.escala.authservice.core.company.port.in;

import com.escala.authservice.core.company.domain.CompanyDomain;
import java.util.List;

public interface CompanyUseCase {
    CompanyDomain create(CompanyDomain company);
    CompanyDomain resolve(String slug);
    List<CompanyDomain> listAll();
}
