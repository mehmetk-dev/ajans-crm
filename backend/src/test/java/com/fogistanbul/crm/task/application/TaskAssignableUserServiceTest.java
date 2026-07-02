package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.messaging.dto.ContactResponse;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskAssignableUserServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;

    @InjectMocks
    private TaskAssignableUserService service;

    @Test
    void staffCanListAgencyRecipientsWithoutCompany() {
        UUID currentUserId = UUID.randomUUID();
        UUID staffRecipientId = UUID.randomUUID();
        UserProfile currentUser = user(currentUserId, GlobalRole.AGENCY_STAFF, "current@example.com", "Current User");
        UserProfile staffRecipient = user(staffRecipientId, GlobalRole.AGENCY_STAFF, "staff@example.com", "Staff Recipient");

        when(userProfileRepository.findById(currentUserId)).thenReturn(Optional.of(currentUser));
        when(membershipRepository.findCompanyIdsByUserId(currentUserId)).thenReturn(List.of());
        when(membershipRepository.findDistinctUserIdsByCompanyIds(List.of())).thenReturn(List.of());
        when(userProfileRepository.findAllById(List.of())).thenReturn(List.of());
        when(userProfileRepository.findByGlobalRole(GlobalRole.AGENCY_STAFF)).thenReturn(List.of(currentUser, staffRecipient));

        List<ContactResponse> recipients = service.getNotificationRecipients(currentUserId, null);

        assertEquals(1, recipients.size());
        assertEquals(staffRecipientId.toString(), recipients.get(0).getId());
    }

    private UserProfile user(UUID id, GlobalRole role, String email, String fullName) {
        return UserProfile.builder()
                .id(id)
                .globalRole(role)
                .email(email)
                .person(Person.builder().fullName(fullName).build())
                .build();
    }
}
