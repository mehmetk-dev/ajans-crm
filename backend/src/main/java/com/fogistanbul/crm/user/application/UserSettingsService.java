package com.fogistanbul.crm.user.application;

import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.PersonRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.user.infrastructure.AvatarStorage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserProfileRepository userProfileRepository;
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;
    private final AvatarStorage avatarStorage;

    @Transactional
    public String updateProfile(UUID userId, String fullName) {
        UserProfile user = requireUser(userId);
        requirePerson(user).setFullName(fullName);
        userProfileRepository.save(user);
        return fullName;
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        UserProfile user = requireUser(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "CURRENT_PASSWORD_INVALID",
                    "Mevcut şifre hatalı"
            );
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userProfileRepository.save(user);
    }

    @Transactional
    public String updateMailEmail(UUID userId, String mailEmail) {
        UserProfile user = requireUser(userId);
        String normalizedEmail = normalizeEmail(mailEmail);
        if (normalizedEmail.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "MAIL_EMAIL_REQUIRED",
                    "Mail e-postası boş olamaz"
            );
        }

        user.setMailEmail(normalizedEmail);
        userProfileRepository.save(user);
        return normalizedEmail;
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    @Transactional
    public String uploadAvatar(UUID userId, MultipartFile file) throws IOException {
        UserProfile user = requireUser(userId);
        String avatarUrl = avatarStorage.store(userId, file);
        Person person = requirePerson(user);
        person.setAvatarUrl(avatarUrl);
        personRepository.save(person);
        return avatarUrl;
    }

    @Transactional(readOnly = true)
    public AvatarStorage.StoredAvatar getAvatar(UUID userId, String fileName) throws IOException {
        return avatarStorage.load(userId, fileName);
    }

    private UserProfile requireUser(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND",
                        "Kullanıcı bulunamadı"
                ));
    }

    private Person requirePerson(UserProfile user) {
        if (user.getPerson() == null) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "PERSON_NOT_FOUND",
                    "Kullanıcı profili bulunamadı"
            );
        }
        return user.getPerson();
    }
}
