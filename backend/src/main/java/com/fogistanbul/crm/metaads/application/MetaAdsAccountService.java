package com.fogistanbul.crm.metaads.application;

import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import com.fogistanbul.crm.instagram.oauth.infrastructure.InstagramTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MetaAdsAccountService {

    private final InstagramTokenRepository tokenRepository;

    @Transactional
    public void saveAdAccountId(UUID companyId, String adAccountId) {
        tokenRepository.findByCompanyId(companyId).ifPresent(token -> {
            token.setMetaAdAccountId(normalizeAdAccountId(adAccountId));
            tokenRepository.save(token);
        });
    }

    public Optional<String> getAdAccountId(UUID companyId) {
        return tokenRepository.findByCompanyId(companyId)
                .map(InstagramToken::getMetaAdAccountId)
                .filter(value -> !value.isBlank());
    }

    String normalizeAdAccountId(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String digits = value.replaceAll("[^0-9]", "");
        return digits.isBlank() ? "" : "act_" + digits;
    }
}
