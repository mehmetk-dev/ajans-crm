# Admin Password Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow an authenticated admin to reset a non-admin user's password from Admin > Users after confirming the admin's own current password.

**Architecture:** Add one validated admin request contract and a transactional operation to the existing cross-role `UserManagementService`. Expose it through the existing admin users controller, revoke the target's refresh tokens, then add a focused React modal called from the existing users table.

**Tech Stack:** Java 17, Spring Boot, Spring Security, Jakarta Validation, JPA, JUnit 5/Mockito, React 19, TypeScript, Axios, Vitest, Testing Library, Tailwind CSS.

## Global Constraints

- Only authenticated users with global role `ADMIN` may perform the reset.
- The acting admin's current password is required and verified on every request.
- The target must not be the acting user and must not have global role `ADMIN`.
- New passwords must contain between 8 and 128 characters.
- Passwords must never be returned, persisted as plaintext, or included in logs.
- The target password update and refresh-token revocation must share one transaction.
- Existing stateless access tokens can remain valid until their configured expiry.
- Preserve the unrelated uncommitted Google Ads changes in the worktree.
- Do not create Git commits; the user explicitly requested continuation without commits.

---

### Task 1: Transactional backend password reset

**Files:**
- Create: `backend/src/main/java/com/fogistanbul/crm/user/application/AdminResetPasswordRequest.java`
- Modify: `backend/src/main/java/com/fogistanbul/crm/user/application/UserManagementService.java`
- Test: `backend/src/test/java/com/fogistanbul/crm/user/application/UserManagementServiceTest.java`

**Interfaces:**
- Consumes: `UserProfileRepository.findById(UUID)`, `PasswordEncoder.matches/encode`, `RefreshTokenRepository.revokeAllByUserId(UUID)`.
- Produces: `UserManagementService.resetPassword(UUID actingAdminId, UUID targetUserId, String adminPassword, String newPassword)` and validated `AdminResetPasswordRequest`.

- [ ] **Step 1: Write failing service tests**

Add mocks for `PersonRepository`, `PasswordEncoder`, and `RefreshTokenRepository`, then add tests with these assertions:

```java
@Test
void validAdminPasswordResetsTargetAndRevokesRefreshTokens() {
    UUID adminId = UUID.randomUUID();
    UUID targetId = UUID.randomUUID();
    UserProfile admin = user(adminId, GlobalRole.ADMIN, "admin-hash");
    UserProfile target = user(targetId, GlobalRole.COMPANY_USER, "old-hash");
    when(userProfileRepository.findById(adminId)).thenReturn(Optional.of(admin));
    when(userProfileRepository.findById(targetId)).thenReturn(Optional.of(target));
    when(passwordEncoder.matches("admin-current", "admin-hash")).thenReturn(true);
    when(passwordEncoder.encode("target-new")).thenReturn("new-hash");

    service.resetPassword(adminId, targetId, "admin-current", "target-new");

    assertEquals("new-hash", target.getPasswordHash());
    verify(userProfileRepository).save(target);
    verify(refreshTokenRepository).revokeAllByUserId(targetId);
}

@Test
void wrongAdminPasswordLeavesTargetUnchanged() {
    UUID adminId = UUID.randomUUID();
    UUID targetId = UUID.randomUUID();
    UserProfile admin = user(adminId, GlobalRole.ADMIN, "admin-hash");
    when(userProfileRepository.findById(adminId)).thenReturn(Optional.of(admin));
    when(passwordEncoder.matches("wrong", "admin-hash")).thenReturn(false);

    ApiException exception = assertThrows(ApiException.class,
            () -> service.resetPassword(adminId, targetId, "wrong", "target-new"));

    assertEquals("ADMIN_PASSWORD_INVALID", exception.getCode());
    verify(userProfileRepository, never()).save(any());
    verify(refreshTokenRepository, never()).revokeAllByUserId(any());
}

@Test
void nonAdminActorIsRejected() {
    UUID actorId = UUID.randomUUID();
    UUID targetId = UUID.randomUUID();
    when(userProfileRepository.findById(actorId)).thenReturn(Optional.of(
            user(actorId, GlobalRole.AGENCY_STAFF, "actor-hash")));

    ApiException exception = assertThrows(ApiException.class,
            () -> service.resetPassword(actorId, targetId, "actor-current", "target-new"));

    assertEquals("ADMIN_PASSWORD_RESET_FORBIDDEN", exception.getCode());
    verify(passwordEncoder, never()).matches(anyString(), anyString());
}

@Test
void adminTargetAndSelfTargetAreRejected() {
    UUID actingId = UUID.randomUUID();
    UUID otherAdminId = UUID.randomUUID();
    UserProfile acting = user(actingId, GlobalRole.ADMIN, "admin-hash");
    when(userProfileRepository.findById(actingId)).thenReturn(Optional.of(acting));
    when(passwordEncoder.matches("admin-current", "admin-hash")).thenReturn(true);
    when(userProfileRepository.findById(otherAdminId)).thenReturn(Optional.of(
            user(otherAdminId, GlobalRole.ADMIN, "other-hash")));

    assertEquals("ADMIN_PASSWORD_RESET_FORBIDDEN", assertThrows(ApiException.class,
            () -> service.resetPassword(actingId, actingId, "admin-current", "target-new")).getCode());
    assertEquals("ADMIN_PASSWORD_RESET_FORBIDDEN", assertThrows(ApiException.class,
            () -> service.resetPassword(actingId, otherAdminId, "admin-current", "target-new")).getCode());
}

@Test
void missingTargetReturnsUserNotFound() {
    UUID adminId = UUID.randomUUID();
    UUID targetId = UUID.randomUUID();
    UserProfile admin = user(adminId, GlobalRole.ADMIN, "admin-hash");
    when(userProfileRepository.findById(adminId)).thenReturn(Optional.of(admin));
    when(passwordEncoder.matches("admin-current", "admin-hash")).thenReturn(true);
    when(userProfileRepository.findById(targetId)).thenReturn(Optional.empty());

    ApiException exception = assertThrows(ApiException.class,
            () -> service.resetPassword(adminId, targetId, "admin-current", "target-new"));

    assertEquals("USER_NOT_FOUND", exception.getCode());
}
```

- [ ] **Step 2: Run the service tests and confirm the red state**

Run:

```bash
cd backend
mvn -Dmaven.repo.local=/tmp/ajans-crm-m2 -Dtest=UserManagementServiceTest test
```

Expected: compilation failure because `resetPassword` and the new collaborators are not implemented.

- [ ] **Step 3: Add the validated request and minimal service implementation**

Create:

```java
package com.fogistanbul.crm.user.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminResetPasswordRequest(
        @NotBlank(message = "Admin şifresi zorunludur")
        @Size(max = 128, message = "Admin şifresi en fazla 128 karakter olabilir")
        String adminPassword,
        @NotBlank(message = "Yeni şifre zorunludur")
        @Size(min = 8, max = 128, message = "Yeni şifre 8 ile 128 karakter arasında olmalıdır")
        String newPassword
) {}
```

Inject `PasswordEncoder` and `RefreshTokenRepository` into `UserManagementService`, then implement:

```java
@Transactional
public void resetPassword(UUID actingAdminId, UUID targetUserId,
        String adminPassword, String newPassword) {
    UserProfile actingAdmin = requireUser(actingAdminId);
    if (actingAdmin.getGlobalRole() != GlobalRole.ADMIN) {
        throw passwordResetForbidden();
    }
    if (!passwordEncoder.matches(adminPassword, actingAdmin.getPasswordHash())) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "ADMIN_PASSWORD_INVALID", "Admin şifresi hatalı");
    }
    if (actingAdminId.equals(targetUserId)) {
        throw passwordResetForbidden();
    }

    UserProfile target = requireUser(targetUserId);
    if (target.getGlobalRole() == GlobalRole.ADMIN) {
        throw passwordResetForbidden();
    }

    target.setPasswordHash(passwordEncoder.encode(newPassword));
    userProfileRepository.save(target);
    refreshTokenRepository.revokeAllByUserId(targetUserId);
}

private ApiException passwordResetForbidden() {
    return new ApiException(HttpStatus.FORBIDDEN, "ADMIN_PASSWORD_RESET_FORBIDDEN",
            "Bu kullanıcının şifresi admin panelinden değiştirilemez");
}
```

- [ ] **Step 4: Run service tests and confirm the green state**

Run the Task 1 Maven command again.

Expected: `UserManagementServiceTest` passes and verifies both password update and token revocation.

---

### Task 2: Admin endpoint and safe activity log

**Files:**
- Modify: `backend/src/main/java/com/fogistanbul/crm/controller/UserManagementController.java`
- Create: `backend/src/test/java/com/fogistanbul/crm/controller/UserManagementControllerTest.java`

**Interfaces:**
- Consumes: `AdminResetPasswordRequest`, authenticated principal UUID, `UserManagementService.resetPassword(...)`.
- Produces: `PUT /api/admin/users/{id}/password` returning `{ "message": "Kullanıcı şifresi başarıyla değiştirildi" }` and an activity entry containing only `operation=password_reset`.

- [ ] **Step 1: Write the failing controller test**

```java
@ExtendWith(MockitoExtension.class)
class UserManagementControllerTest {
    @Mock UserManagementService userManagementService;
    @Mock ActivityLogService activityLogService;
    @Mock Authentication authentication;
    @InjectMocks UserManagementController controller;

    @Test
    void resetPasswordPassesActorAndLogsOnlySafeMetadata() {
        UUID actorId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        when(authentication.getPrincipal()).thenReturn(actorId);
        AdminResetPasswordRequest request =
                new AdminResetPasswordRequest("admin-current", "target-new");

        ResponseEntity<Map<String, String>> response =
                controller.resetPassword(targetId, request, authentication);

        verify(userManagementService).resetPassword(
                actorId, targetId, "admin-current", "target-new");
        verify(activityLogService).log(actorId, ActivityAction.UPDATE, "USER",
                targetId, null, Map.of("operation", "password_reset"));
        assertEquals("Kullanıcı şifresi başarıyla değiştirildi",
                response.getBody().get("message"));
    }
}
```

- [ ] **Step 2: Run the controller test and confirm the red state**

Run:

```bash
cd backend
mvn -Dmaven.repo.local=/tmp/ajans-crm-m2 -Dtest=UserManagementControllerTest test
```

Expected: compilation failure because the controller method is not implemented.

- [ ] **Step 3: Implement the endpoint**

Add this method to `UserManagementController`:

```java
@PutMapping("/{id}/password")
public ResponseEntity<Map<String, String>> resetPassword(
        @PathVariable UUID id,
        @Valid @RequestBody AdminResetPasswordRequest request,
        Authentication auth
) {
    UUID actingAdminId = actorId(auth);
    userManagementService.resetPassword(
            actingAdminId, id, request.adminPassword(), request.newPassword());
    activityLogService.log(actingAdminId, ActivityAction.UPDATE, "USER",
            id, null, Map.of("operation", "password_reset"));
    return ResponseEntity.ok(Map.of(
            "message", "Kullanıcı şifresi başarıyla değiştirildi"));
}
```

- [ ] **Step 4: Run controller and service tests**

Run:

```bash
cd backend
mvn -Dmaven.repo.local=/tmp/ajans-crm-m2 -Dtest=UserManagementControllerTest,UserManagementServiceTest test
```

Expected: both test classes pass.

---

### Task 3: Admin API client and password reset modal

**Files:**
- Modify: `frontend/src/api/admin.ts`
- Create: `frontend/src/pages/admin/UserPasswordResetModal.tsx`
- Create: `frontend/src/pages/admin/UserPasswordResetModal.test.tsx`

**Interfaces:**
- Consumes: target `AllUserResponse`, `adminApi.resetUserPassword(userId, input)`, `getApiErrorMessage`.
- Produces: `ResetUserPasswordInput`, `ResetUserPasswordResponse`, a modal with client-side validation, visible API errors, and an `onSuccess(message)` callback.

- [ ] **Step 1: Write failing modal tests**

Mock `adminApi.resetUserPassword`, render a company user, and cover these behaviors:

```tsx
it('blocks mismatched passwords without calling the API', async () => {
    render(<UserPasswordResetModal user={user} onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Yeni şifre'), { target: { value: 'new-pass-1' } });
    fireEvent.change(screen.getByLabelText('Yeni şifre tekrarı'), { target: { value: 'new-pass-2' } });
    fireEvent.change(screen.getByLabelText('Admin mevcut şifresi'), { target: { value: 'admin-current' } });
    expect(screen.getByRole('button', { name: 'Şifreyi Değiştir' })).toBeDisabled();
    expect(mocks.resetUserPassword).not.toHaveBeenCalled();
});

it('submits only the target id and two required passwords', async () => {
    mocks.resetUserPassword.mockResolvedValue({ message: 'Kullanıcı şifresi başarıyla değiştirildi' });
    const onSuccess = vi.fn();
    render(<UserPasswordResetModal user={user} onClose={vi.fn()} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText('Yeni şifre'), { target: { value: 'new-pass-1' } });
    fireEvent.change(screen.getByLabelText('Yeni şifre tekrarı'), { target: { value: 'new-pass-1' } });
    fireEvent.change(screen.getByLabelText('Admin mevcut şifresi'), { target: { value: 'admin-current' } });
    fireEvent.click(screen.getByRole('button', { name: 'Şifreyi Değiştir' }));

    await waitFor(() => expect(mocks.resetUserPassword).toHaveBeenCalledWith(user.id, {
        adminPassword: 'admin-current',
        newPassword: 'new-pass-1',
    }));
    expect(onSuccess).toHaveBeenCalledWith('Kullanıcı şifresi başarıyla değiştirildi');
});

it('keeps backend errors visible in the modal', async () => {
    mocks.resetUserPassword.mockRejectedValue({
        response: { status: 400, data: { code: 'ADMIN_PASSWORD_INVALID', message: 'Admin şifresi hatalı' } },
    });
    render(<UserPasswordResetModal user={user} onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Yeni şifre'), { target: { value: 'new-pass-1' } });
    fireEvent.change(screen.getByLabelText('Yeni şifre tekrarı'), { target: { value: 'new-pass-1' } });
    fireEvent.change(screen.getByLabelText('Admin mevcut şifresi'), { target: { value: 'wrong-admin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Şifreyi Değiştir' }));
    expect(await screen.findByText('Admin şifresi hatalı')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the modal tests and confirm the red state**

Run:

```bash
cd frontend
npm run test:ci -- src/pages/admin/UserPasswordResetModal.test.tsx
```

Expected: module resolution failure because the modal and API method do not exist.

- [ ] **Step 3: Add the typed API method**

```ts
export interface ResetUserPasswordInput {
    adminPassword: string;
    newPassword: string;
}

export interface ResetUserPasswordResponse {
    message: string;
}

resetUserPassword: (userId: string, input: ResetUserPasswordInput) =>
    api.put<ResetUserPasswordResponse>(`/admin/users/${userId}/password`, input)
        .then(r => r.data),
```

- [ ] **Step 4: Implement the focused modal**

Create a controlled form that:

```tsx
const canSubmit = newPassword.length >= 8
    && newPassword.length <= 128
    && newPassword === confirmation
    && adminPassword.length > 0
    && !saving;

const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
        const result = await adminApi.resetUserPassword(user.id, {
            adminPassword,
            newPassword,
        });
        clearPasswords();
        onSuccess(result.message);
    } catch (failure: unknown) {
        setError(getApiErrorMessage(failure, 'Kullanıcı şifresi değiştirilemedi'));
    } finally {
        setSaving(false);
    }
};
```

The markup must provide labeled password inputs, visibility buttons, mismatch/length guidance, the active-session warning, `İptal`, and `Şifreyi Değiştir`. Closing must clear local password state before calling `onClose`.

- [ ] **Step 5: Run modal tests and confirm the green state**

Run the Task 3 frontend command again.

Expected: all modal tests pass.

---

### Task 4: Wire the modal into Admin > Users

**Files:**
- Modify: `frontend/src/pages/admin/UsersPage.tsx`
- Create: `frontend/src/pages/admin/UsersPage.test.tsx`

**Interfaces:**
- Consumes: `UserPasswordResetModal`, `AllUserResponse.globalRole`.
- Produces: password action for non-admin rows only and visible page-level success feedback.

- [ ] **Step 1: Write failing page integration tests**

Mock `adminApi.getAllUsers` with one `ADMIN` and one `COMPANY_USER`, then assert:

```tsx
expect(await screen.findByText('Şirket Kullanıcısı')).toBeInTheDocument();
expect(screen.getAllByRole('button', { name: 'Şifre Değiştir' })).toHaveLength(1);

fireEvent.click(screen.getByRole('button', { name: 'Şifre Değiştir' }));
expect(screen.getByRole('heading', { name: 'Kullanıcı Şifresini Değiştir' })).toBeInTheDocument();
```

In a success test, fill the modal and resolve the API call, then assert:

```tsx
expect(await screen.findByText('Kullanıcı şifresi başarıyla değiştirildi')).toBeInTheDocument();
expect(screen.queryByRole('heading', { name: 'Kullanıcı Şifresini Değiştir' })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run page tests and confirm the red state**

Run:

```bash
cd frontend
npm run test:ci -- src/pages/admin/UsersPage.test.tsx
```

Expected: no accessible `Şifre Değiştir` action exists.

- [ ] **Step 3: Add table action and success feedback**

Add page state:

```tsx
const [passwordResetUser, setPasswordResetUser] = useState<AllUserResponse | null>(null);
const [success, setSuccess] = useState('');
```

Add a non-admin row action with an accessible name:

```tsx
<button
    onClick={() => { setPasswordResetUser(u); setSuccess(''); }}
    aria-label="Şifre Değiştir"
    title="Şifre Değiştir"
>
    <KeyRound className="w-3.5 h-3.5" />
</button>
```

Render a visible success banner and the modal:

```tsx
{passwordResetUser && (
    <UserPasswordResetModal
        user={passwordResetUser}
        onClose={() => setPasswordResetUser(null)}
        onSuccess={(message) => {
            setPasswordResetUser(null);
            setSuccess(message);
        }}
    />
)}
```

- [ ] **Step 4: Run page and modal tests**

Run:

```bash
cd frontend
npm run test:ci -- src/pages/admin/UsersPage.test.tsx src/pages/admin/UserPasswordResetModal.test.tsx
```

Expected: all password reset UI tests pass.

---

### Task 5: Security and regression verification

**Files:**
- Verify all changed feature files and preserve the existing Google Ads diff.

**Interfaces:**
- Consumes: completed backend endpoint and frontend flow.
- Produces: evidence that the new flow is secure, typed, tested, and does not regress existing code.

- [ ] **Step 1: Run targeted backend tests**

```bash
cd backend
mvn -Dmaven.repo.local=/tmp/ajans-crm-m2 -Dtest=UserManagementControllerTest,UserManagementServiceTest test
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 2: Run the full backend suite**

```bash
cd backend
mvn -Dmaven.repo.local=/tmp/ajans-crm-m2 test
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 3: Run targeted frontend tests**

```bash
cd frontend
npm run test:ci -- src/pages/admin/UsersPage.test.tsx src/pages/admin/UserPasswordResetModal.test.tsx
```

Expected: both test files pass.

- [ ] **Step 4: Run frontend static verification**

```bash
cd frontend
npm run lint
npm run build
```

Expected: lint exits successfully and Vite production build completes.

- [ ] **Step 5: Review the security invariants in the final diff**

Run:

```bash
rg -n "adminPassword|newPassword|password_reset" backend/src/main frontend/src
git diff --check
git status --short
```

Expected: password values appear only in request/form processing, no password value is logged or returned, `password_reset` is the only activity detail, `git diff --check` is silent, and the pre-existing Google Ads files remain untouched by this feature.
