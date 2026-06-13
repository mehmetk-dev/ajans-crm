package com.fogistanbul.crm.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ApiErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "İstek alanlarını kontrol edin"),
    MISSING_PARAMETER(HttpStatus.BAD_REQUEST, "Zorunlu istek parametresi eksik"),
    TYPE_MISMATCH(HttpStatus.BAD_REQUEST, "İstek parametresi geçersiz"),
    MALFORMED_REQUEST(HttpStatus.BAD_REQUEST, "İstek gövdesi okunamadı"),
    INVALID_ARGUMENT(HttpStatus.BAD_REQUEST, "Geçersiz istek"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Geçersiz email veya şifre"),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "Geçersiz oturum yenileme isteği"),
    AUTHENTICATION_REQUIRED(HttpStatus.UNAUTHORIZED, "Kimlik doğrulaması gerekli"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Kimlik doğrulaması gerekli"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Erişim yetkiniz yok"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "İstenen kaynak bulunamadı"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı"),
    COMPANY_NOT_FOUND(HttpStatus.NOT_FOUND, "Şirket bulunamadı"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "Bu HTTP metodu desteklenmiyor"),
    CONFLICT(HttpStatus.CONFLICT, "İşlem mevcut kayıtla çakıştı"),
    INVALID_STATE(HttpStatus.CONFLICT, "İşlem mevcut durumda gerçekleştirilemiyor"),
    DATA_INTEGRITY_VIOLATION(HttpStatus.CONFLICT, "İşlem veri bütünlüğü kuralıyla çakıştı"),
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "Çok fazla istek. Lütfen daha sonra tekrar deneyin"),
    PAYLOAD_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE, "Yüklenen veri izin verilen boyutu aşıyor"),
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "İçerik türü desteklenmiyor"),
    MULTIPART_ERROR(HttpStatus.BAD_REQUEST, "Dosya yükleme isteği okunamadı"),
    FILE_UPLOAD_ERROR(HttpStatus.BAD_REQUEST, "Dosya yükleme hatası"),
    EXTERNAL_SERVICE_ERROR(HttpStatus.BAD_GATEWAY, "Harici servis hatası. Lütfen tekrar deneyin"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Bir hata oluştu. Lütfen tekrar deneyin.");

    private final HttpStatus status;
    private final String defaultMessage;
}
