package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.CreateSurveyRequest;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.SatisfactionSurveyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SurveyServiceTest {

    @Mock
    private SatisfactionSurveyRepository surveyRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;

    @InjectMocks
    private SurveyService service;

    @Test
    void surveySubmissionRequiresAnOwnerMembership() {
        UUID userId = UUID.randomUUID();
        CompanyMembership employeeMembership = CompanyMembership.builder()
                .membershipRole(MembershipRole.EMPLOYEE)
                .build();
        when(membershipRepository.findByUserId(userId)).thenReturn(List.of(employeeMembership));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.submitSurvey(userId, new CreateSurveyRequest())
        );

        assertEquals("SURVEY_OWNER_REQUIRED", exception.getCode());
        verifyNoInteractions(userProfileRepository, companyRepository, surveyRepository);
    }
}
