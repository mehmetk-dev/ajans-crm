package com.fogistanbul.crm.user.application;

import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.PersonRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.user.infrastructure.AvatarStorage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserSettingsServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private PersonRepository personRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AvatarStorage avatarStorage;

    @InjectMocks
    private UserSettingsService service;

    @Test
    void profileUpdateChangesTheCurrentUsersPerson() {
        UUID userId = UUID.randomUUID();
        UserProfile user = user(userId);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        String fullName = service.updateProfile(userId, "Yeni İsim");

        assertEquals("Yeni İsim", fullName);
        assertEquals("Yeni İsim", user.getPerson().getFullName());
        verify(userProfileRepository).save(user);
    }

    @Test
    void wrongCurrentPasswordIsRejectedWithoutSaving() {
        UUID userId = UUID.randomUUID();
        UserProfile user = user(userId);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("yanlış", "old-hash")).thenReturn(false);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.changePassword(userId, "yanlış", "new-password")
        );

        assertEquals("CURRENT_PASSWORD_INVALID", exception.getCode());
        verify(userProfileRepository, never()).save(user);
    }

    @Test
    void validCurrentPasswordIsReplacedWithANewHash() {
        UUID userId = UUID.randomUUID();
        UserProfile user = user(userId);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

        service.changePassword(userId, "old-password", "new-password");

        assertEquals("new-hash", user.getPasswordHash());
        verify(userProfileRepository).save(user);
    }

    @Test
    void updateMailEmailDoesNotChangeLoginEmail() {
        UUID userId = UUID.randomUUID();
        UserProfile user = userWithEmail(userId, "login@test.com");
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        String result = service.updateMailEmail(userId, " Notify@Test.com ");

        assertEquals("notify@test.com", result);
        assertEquals("login@test.com", user.getEmail());
        assertEquals("notify@test.com", user.getMailEmail());
        verify(userProfileRepository).save(user);
    }

    @Test
    void updateMailEmailRejectsBlankAddressWithoutSaving() {
        UUID userId = UUID.randomUUID();
        UserProfile user = userWithEmail(userId, "login@test.com");
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.updateMailEmail(userId, " ")
        );

        assertEquals("MAIL_EMAIL_REQUIRED", exception.getCode());
        verify(userProfileRepository, never()).save(user);
    }

    private UserProfile user(UUID userId) {
        return UserProfile.builder()
                .id(userId)
                .person(Person.builder().fullName("Eski İsim").build())
                .passwordHash("old-hash")
                .build();
    }

    private UserProfile userWithEmail(UUID userId, String email) {
        return UserProfile.builder()
                .id(userId)
                .person(Person.builder().fullName("Eski İsim").build())
                .email(email)
                .passwordHash("old-hash")
                .build();
    }
}
