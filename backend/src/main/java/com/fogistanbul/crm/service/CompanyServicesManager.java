package com.fogistanbul.crm.service;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyServicesManager {

    private final CompanyServiceRepository companyServiceRepository;
    private final CompanyRepository companyRepository;

    /**
     * Şirket oluşturulduğunda 6 kategorinin tamamı için kayıt oluşturur.
     * selectedCategories null/boş gelirse hepsi false; değer gelirse seçilenler true.
     */
    @Transactional
    public void initializeServicesForCompany(UUID companyId, List<String> selectedCategories) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> companyNotFound());

        for (ServiceCategory category : ServiceCategory.values()) {
            boolean active = selectedCategories != null &&
                    selectedCategories.stream().anyMatch(s -> s.equalsIgnoreCase(category.name()));

            com.fogistanbul.crm.entity.CompanyService cs = com.fogistanbul.crm.entity.CompanyService.builder()
                    .company(company)
                    .serviceCategory(category)
                    .active(active)
                    .build();
            companyServiceRepository.save(cs);
        }
    }

    /**
     * Admin: şirketin tüm hizmetlerini listele (aktif + pasif)
     */
    @Transactional(readOnly = true)
    public List<ServiceItem> getAllServices(UUID companyId) {
        // Önce mevcut kayıtları al
        List<com.fogistanbul.crm.entity.CompanyService> existing =
                companyServiceRepository.findByCompanyId(companyId);

        // Eksik kategoriler varsa oluştur (eski şirketler için fallback)
        List<ServiceCategory> existingCategories = existing.stream()
                .map(com.fogistanbul.crm.entity.CompanyService::getServiceCategory)
                .collect(Collectors.toList());

        for (ServiceCategory cat : ServiceCategory.values()) {
            if (!existingCategories.contains(cat)) {
                Company company = companyRepository.findById(companyId)
                        .orElseThrow(this::companyNotFound);
                com.fogistanbul.crm.entity.CompanyService cs = com.fogistanbul.crm.entity.CompanyService.builder()
                        .company(company)
                        .serviceCategory(cat)
                        .active(false)
                        .build();
                existing.add(companyServiceRepository.save(cs));
            }
        }

        // Enum sırasına göre döndür
        return Arrays.stream(ServiceCategory.values())
                .map(cat -> existing.stream()
                        .filter(cs -> cs.getServiceCategory() == cat)
                        .findFirst()
                        .map(cs -> new ServiceItem(cat.name(), cs.isActive(), cs.getId().toString()))
                        .orElse(new ServiceItem(cat.name(), false, null)))
                .collect(Collectors.toList());
    }

    /**
     * Client: sadece aktif hizmetleri döndür
     */
    @Transactional(readOnly = true)
    public List<String> getActiveServiceCategories(UUID companyId) {
        return companyServiceRepository.findByCompanyIdAndActiveTrue(companyId)
                .stream()
                .map(cs -> cs.getServiceCategory().name())
                .collect(Collectors.toList());
    }

    /**
     * Admin: tek bir hizmetin aktiflik durumunu değiştir
     */
    @Transactional
    public ServiceItem toggleService(UUID companyId, String categoryName, boolean active) {
        ServiceCategory category;
        try {
            category = ServiceCategory.valueOf(categoryName.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_SERVICE_CATEGORY",
                    "Geçersiz hizmet kategorisi"
            );
        }

        com.fogistanbul.crm.entity.CompanyService cs =
                companyServiceRepository.findByCompanyIdAndServiceCategory(companyId, category)
                        .orElseGet(() -> {
                            Company company = companyRepository.findById(companyId)
                                    .orElseThrow(this::companyNotFound);
                            return companyServiceRepository.save(
                                    com.fogistanbul.crm.entity.CompanyService.builder()
                                            .company(company)
                                            .serviceCategory(category)
                                            .active(false)
                                            .build()
                            );
                        });

        cs.setActive(active);
        companyServiceRepository.save(cs);
        return new ServiceItem(category.name(), active, cs.getId().toString());
    }

    private ApiException companyNotFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Şirket bulunamadı");
    }

    public record ServiceItem(String category, boolean active, String id) {}
}
