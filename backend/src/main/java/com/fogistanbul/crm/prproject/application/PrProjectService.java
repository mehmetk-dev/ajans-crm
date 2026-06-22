package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.prproject.dto.CreatePrProjectRequest;
import com.fogistanbul.crm.prproject.dto.PrProjectResponse;
import com.fogistanbul.crm.prproject.dto.UpdatePrProjectRequest;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.PrProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrProjectService {

    private final PrProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final PrProjectParticipantService participantService;
    private final PrProjectPhaseService phaseService;
    private final PrProjectAccessPolicy accessPolicy;
    private final PrProjectMapper mapper;

    @Transactional
    public PrProjectResponse createProject(CreatePrProjectRequest request, UUID createdById) {
        UserProfile creator = participantService.getUser(createdById);
        Company company = getCompany(request.getCompanyId());
        UUID companyId = company != null ? company.getId() : null;
        accessPolicy.requireCreate(creator, companyId);

        UserProfile responsible =
                participantService.getOptionalUser(request.getResponsibleId(), companyId);
        int totalPhases = request.getPhases() != null
                ? request.getPhases().size()
                : request.getTotalPhases() != null ? request.getTotalPhases() : 0;

        PrProject project = projectRepository.save(PrProject.builder()
                .company(company)
                .name(request.getName().trim())
                .purpose(request.getPurpose())
                .totalPhases(totalPhases)
                .responsible(responsible)
                .startDate(PrProjectDates.parse(request.getStartDate()))
                .endDate(PrProjectDates.parse(request.getEndDate()))
                .notes(request.getNotes())
                .createdBy(creator)
                .build());

        phaseService.createPhases(project, request.getPhases(), creator);
        participantService.addMembers(project, request.getMemberIds());
        log.info("PR project created: {}", project.getName());
        return mapper.toResponse(project);
    }

    @Transactional(readOnly = true)
    public Page<PrProjectResponse> getAllProjects(Pageable pageable, UUID userId) {
        UserProfile user = participantService.getUser(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return projectRepository.findAll(pageable).map(mapper::toResponse);
        }
        return projectRepository.findAccessibleProjects(
                accessPolicy.accessibleCompanyIds(user),
                userId,
                pageable
        ).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PrProjectResponse> getProjectsByCompany(
            UUID companyId,
            Pageable pageable,
            UUID userId
    ) {
        UserProfile user = participantService.getUser(userId);
        accessPolicy.requireCreate(user, companyId);
        return projectRepository.findByCompanyId(companyId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PrProjectResponse getProjectById(UUID projectId, UUID userId) {
        PrProject project = getProject(projectId);
        accessPolicy.requireRead(project, participantService.getUser(userId));
        return mapper.toResponse(project);
    }

    @Transactional
    public PrProjectResponse updateProject(
            UUID projectId,
            UpdatePrProjectRequest request,
            UUID userId
    ) {
        PrProject project = getProject(projectId);
        UserProfile user = participantService.getUser(userId);
        accessPolicy.requireManage(project, user);

        Company targetCompany = request.getCompanyId() != null
                ? getCompany(request.getCompanyId())
                : project.getCompany();
        UUID targetCompanyId = targetCompany != null ? targetCompany.getId() : null;
        if (request.getCompanyId() != null) {
            accessPolicy.requireCreate(user, targetCompanyId);
            participantService.requireExistingParticipantsForCompany(project, targetCompanyId);
            project.setCompany(targetCompany);
            phaseService.updateLinkedTaskCompanies(project);
        }

        if (request.getName() != null) {
            project.setName(request.getName().trim());
            phaseService.updateLinkedTaskProjectName(project);
        }
        if (request.getPurpose() != null) {
            project.setPurpose(request.getPurpose());
        }
        if (request.getNotes() != null) {
            project.setNotes(request.getNotes());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(PrProjectDates.parse(request.getStartDate()));
        }
        if (request.getEndDate() != null) {
            project.setEndDate(PrProjectDates.parse(request.getEndDate()));
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getResponsibleId() != null) {
            project.setResponsible(participantService.getOptionalUser(
                    request.getResponsibleId(), targetCompanyId));
            phaseService.updateResponsibleFallbackTasks(project);
        }

        phaseService.updatePhases(project, request.getPhases());
        projectRepository.save(project);
        return mapper.toResponse(project);
    }

    @Transactional
    public PrProjectResponse completePhase(UUID projectId, UUID phaseId, UUID userId) {
        PrProject project = getProject(projectId);
        accessPolicy.requireManage(project, participantService.getUser(userId));
        phaseService.completePhase(project, phaseId);
        return mapper.toResponse(project);
    }

    @Transactional
    public PrProjectResponse addPhaseNote(
            UUID projectId,
            UUID phaseId,
            String content,
            UUID userId
    ) {
        PrProject project = getProject(projectId);
        UserProfile author = participantService.getUser(userId);
        accessPolicy.requireRead(project, author);
        phaseService.addNote(project, phaseId, content, author);
        return mapper.toResponse(project);
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID userId) {
        PrProject project = getProject(projectId);
        accessPolicy.requireManage(project, participantService.getUser(userId));
        projectRepository.delete(project);
    }

    private PrProject getProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("PR projesi bulunamadı"));
    }

    private Company getCompany(UUID companyId) {
        if (companyId == null) {
            return null;
        }
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Şirket bulunamadı"));
    }
}
