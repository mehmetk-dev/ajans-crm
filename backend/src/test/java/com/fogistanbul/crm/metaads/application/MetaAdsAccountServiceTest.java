package com.fogistanbul.crm.metaads.application;

import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import com.fogistanbul.crm.instagram.oauth.infrastructure.InstagramTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MetaAdsAccountServiceTest {

    @Mock
    InstagramTokenRepository tokenRepository;

    MetaAdsAccountService service;

    @BeforeEach
    void setUp() {
        service = new MetaAdsAccountService(tokenRepository);
    }

    @Test
    void normalizeAdAccountId_keepsOnlyDigitsAndAddsPrefix() {
        assertThat(service.normalizeAdAccountId("act_123-456"))
                .isEqualTo("act_123456");
        assertThat(service.normalizeAdAccountId("123456"))
                .isEqualTo("act_123456");
        assertThat(service.normalizeAdAccountId("invalid")).isEmpty();
    }

    @Test
    void saveAdAccountId_blankValueClearsAccount() {
        UUID companyId = UUID.randomUUID();
        InstagramToken token = InstagramToken.builder()
                .metaAdAccountId("act_123")
                .build();
        when(tokenRepository.findByCompanyId(companyId))
                .thenReturn(Optional.of(token));

        service.saveAdAccountId(companyId, "");

        assertThat(token.getMetaAdAccountId()).isEmpty();
        verify(tokenRepository).save(token);
    }

    @Test
    void getAdAccountId_ignoresBlankValue() {
        UUID companyId = UUID.randomUUID();
        when(tokenRepository.findByCompanyId(companyId)).thenReturn(Optional.of(
                InstagramToken.builder().metaAdAccountId("").build()));

        assertThat(service.getAdAccountId(companyId)).isEmpty();
    }
}
