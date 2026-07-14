# Admin Password Reset Design

## Objective

Add a temporary, email-independent password reset flow to the existing Admin > Users page. A logged-in admin can set a new password for any non-admin user only after confirming the admin's own current password.

The supported targets are company owners, company employees, and agency staff. Existing password hashes are never displayed or recovered.

## Non-goals

- Email-based forgot-password links
- Resetting another admin account
- Resetting the acting admin's own password through this flow
- Automatically generating or displaying a temporary password
- Forcing a password change on the target user's next login
- Changing the existing self-service password change flow in Settings

## User Experience

The Admin > Users table will show a password-reset action for every non-admin user. Selecting it opens a modal that identifies the target user and contains:

- New password
- New password confirmation
- Acting admin's current password

All fields use password inputs with visibility toggles. The new password must be between 8 and 128 characters. The confirmation must match before the request can be submitted.

The modal explains that the target user's refresh sessions will be revoked and that an already-issued access token can remain valid until its configured expiry under the current stateless JWT architecture. On success, the modal closes and the Users page shows a visible success message. Errors remain visible inside the modal.

The admin communicates the new password to the user through an agreed out-of-band channel until email-based reset links are implemented.

## API Contract

Add an admin-only endpoint:

```text
PUT /api/admin/users/{userId}/password
```

Request body:

```json
{
  "adminPassword": "current admin password",
  "newPassword": "new target password"
}
```

Successful response:

```json
{
  "message": "Kullanıcı şifresi başarıyla değiştirildi"
}
```

Validation and error behavior:

- `400 ADMIN_PASSWORD_INVALID`: the acting admin's password is wrong.
- `400 VALIDATION_ERROR`: the new password is outside the 8-128 character range.
- `403 ADMIN_PASSWORD_RESET_FORBIDDEN`: the target is an admin or the acting user.
- `404 USER_NOT_FOUND`: the target user does not exist.
- Existing centralized API error formatting remains in use.

The endpoint stays under `/api/admin/**`, so the existing security configuration requires the `ADMIN` role. The application service repeats the role check as defense in depth.

## Backend Design

Add an `AdminResetPasswordRequest` DTO with validation constraints. Extend `UserManagementController` and `UserManagementService` instead of placing reset behavior in company- or staff-specific modules, because Admin > Users already owns the cross-role user-management surface.

The service operation will run transactionally:

1. Load the acting user from the authenticated principal.
2. Require the acting user's global role to be `ADMIN`.
3. Verify `adminPassword` against the acting user's BCrypt hash.
4. Load the target user.
5. Reject acting-user and `ADMIN` targets.
6. BCrypt-encode and store the target's new password.
7. Revoke all non-revoked refresh tokens belonging to the target.

No plaintext password is persisted, returned, or logged.

The controller records an `UPDATE` activity for the target user with safe metadata such as `operation=password_reset`. Neither password field is included in activity metadata.

## Session Behavior

`RefreshTokenRepository.revokeAllByUserId(...)` is called as part of the reset transaction. This prevents the target's existing refresh sessions from issuing new access tokens.

The current access tokens are stateless. Their default lifetime is 30 minutes, but production can override it through `JWT_ACCESS_EXPIRY`. Immediate access-token invalidation would require a credential-version or token-denylist architecture and is intentionally outside this temporary feature's scope. The modal therefore says that an active session can continue until the current access token expires instead of promising a fixed duration.

## Security Requirements

- Only authenticated admins can reach the endpoint.
- The admin's current password is required for every reset attempt.
- Backend authorization does not rely on the frontend hiding the action.
- Admin targets and self-targeting are rejected in the backend.
- Request DTOs enforce bounded input lengths.
- Passwords are processed only through `PasswordEncoder` and are never logged.
- The existing CSRF protection applies to the state-changing request.
- Error responses do not expose password hashes or internal exception details.
- Refresh-token revocation and password update occur in one transaction.

## Frontend Design

Extend the existing Users page and admin API client:

- Add `adminApi.resetUserPassword(userId, input)`.
- Add a reset action only when `globalRole !== 'ADMIN'`.
- Add a focused password-reset modal rather than expanding the existing role/profile forms.
- Keep new-password confirmation client-side; only the confirmed password and admin password are sent.
- Disable submission while fields are incomplete, invalid, mismatched, or the request is pending.
- Clear all password state when the modal closes or the operation succeeds.

## Testing

Backend tests will cover:

- A valid admin password resets a non-admin user's BCrypt hash.
- The target's refresh tokens are revoked.
- A wrong admin password leaves the target unchanged.
- Admin targets and self-targets are rejected.
- Missing targets return the expected error.
- DTO validation rejects short and excessively long passwords.
- The controller passes the authenticated admin ID and does not expose secrets.

Frontend tests will cover:

- Reset actions appear for non-admin users and remain hidden for admins.
- Mismatched passwords block submission.
- The API receives the target ID, admin password, and confirmed new password.
- Password fields are cleared and success feedback is visible after completion.
- Backend errors remain visible in the modal.

Final verification will run targeted backend and frontend tests, the full backend suite, frontend lint, frontend production build, and `git diff --check`.

## Acceptance Criteria

- An admin can reset a company owner, company employee, or agency staff password from Admin > Users.
- The reset fails when the acting admin's current password is incorrect.
- Admin and self targets cannot be reset through this endpoint.
- The stored target password is a BCrypt hash and the plaintext is never logged.
- All target refresh tokens are revoked after a successful reset.
- The UI reports success and actionable validation/API errors.
- Existing Google Ads worktree changes remain separate from this feature.
