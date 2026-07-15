package com.fogistanbul.crm.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactFormRequest(
        @NotBlank(message = "Ad soyad zorunludur")
        @Size(min = 2, max = 100, message = "Ad soyad 2-100 karakter olmalıdır")
        String name,

        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta adresi girin")
        @Size(max = 254, message = "E-posta en fazla 254 karakter olabilir")
        String email,

        @Size(max = 30, message = "Telefon en fazla 30 karakter olabilir")
        String phone,

        @Size(max = 120, message = "Şirket adı en fazla 120 karakter olabilir")
        String company,

        @NotBlank(message = "Hizmet seçimi zorunludur")
        @Size(max = 80, message = "Hizmet en fazla 80 karakter olabilir")
        String service,

        @NotBlank(message = "Mesaj zorunludur")
        @Size(min = 10, max = 2000, message = "Mesaj 10-2000 karakter olmalıdır")
        String message,

        @Size(max = 200, message = "Website alanı geçersiz")
        String website
) {
}
