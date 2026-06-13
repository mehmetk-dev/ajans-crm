package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.CreateSurveyRequest;
import com.fogistanbul.crm.dto.SurveyResponse;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.SatisfactionSurvey;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.SatisfactionSurveyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SatisfactionSurveyRepository surveyRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMembershipRepository membershipRepository;

    @Transactional
    public SurveyResponse submitSurvey(UUID userId, CreateSurveyRequest request) {
        List<CompanyMembership> memberships = membershipRepository.findByUserId(userId);
        boolean isOwner = memberships.stream()
                .anyMatch(membership -> membership.getMembershipRole() == MembershipRole.OWNER);
        if (!isOwner) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "SURVEY_OWNER_REQUIRED",
                    "Anket göndermek için şirket sahibi olmalısınız"
            );
        }

        UserProfile user = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND",
                        "Kullanıcı bulunamadı"
                ));

        UUID companyId = memberships.stream()
                .filter(membership -> membership.getCompany().getKind() == CompanyKind.CLIENT)
                .map(membership -> membership.getCompany().getId())
                .findFirst()
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "COMPANY_NOT_FOUND",
                        "Şirket bulunamadı"
                ));

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "COMPANY_NOT_FOUND",
                        "Şirket bulunamadı"
                ));

        // Current month
        LocalDate surveyMonth = LocalDate.now().withDayOfMonth(1);

        // Check if already submitted this month
        surveyRepository.findByCompanyIdAndSubmittedByIdAndSurveyMonth(companyId, userId, surveyMonth)
                .ifPresent(s -> {
                    throw new ApiException(
                            HttpStatus.CONFLICT,
                            "SURVEY_ALREADY_SUBMITTED",
                            "Bu ay için zaten anket gönderdiniz"
                    );
                });

        SatisfactionSurvey survey = SatisfactionSurvey.builder()
                .company(company)
                .score(request.getScore())
                .surveyMonth(surveyMonth)
                .comment(request.getComment())
                .submittedBy(user)
                .build();

        survey = surveyRepository.save(survey);
        return toResponse(survey);
    }

    @Transactional(readOnly = true)
    public List<SurveyResponse> getMySurveys(UUID userId) {
        return surveyRepository.findBySubmittedById(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SurveyResponse> getCompanySurveys(UUID companyId) {
        return surveyRepository.findByCompanyIdOrderBySurveyMonthDesc(companyId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SurveyResponse> getAllSurveys() {
        return surveyRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private SurveyResponse toResponse(SatisfactionSurvey survey) {
        return SurveyResponse.builder()
                .id(survey.getId().toString())
                .companyId(survey.getCompany().getId().toString())
                .companyName(survey.getCompany().getName())
                .score(survey.getScore())
                .surveyMonth(survey.getSurveyMonth().toString())
                .submittedById(survey.getSubmittedBy().getId().toString())
                .submittedByName(survey.getSubmittedBy().getPerson() != null
                        ? survey.getSubmittedBy().getPerson().getFullName()
                        : survey.getSubmittedBy().getEmail())
                .createdAt(survey.getCreatedAt())
                .build();
    }
}
