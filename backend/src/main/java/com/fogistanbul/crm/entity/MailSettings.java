package com.fogistanbul.crm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "mail_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MailSettings {

    public static final short SINGLETON_ID = 1;

    @Id
    private Short id;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = false;

    @Column(nullable = false, length = 255)
    @Builder.Default
    private String host = "smtp.gmail.com";

    @Column(nullable = false)
    @Builder.Default
    private Integer port = 587;

    @Column(length = 255)
    private String username;

    @Column
    private String password;

    @Column(name = "from_address", nullable = false, length = 255)
    @Builder.Default
    private String fromAddress = "noreply@fogistanbul.com";

    @Column(name = "smtp_auth", nullable = false)
    @Builder.Default
    private Boolean smtpAuth = true;

    @Column(name = "start_tls", nullable = false)
    @Builder.Default
    private Boolean startTls = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PreUpdate
    void touchUpdatedAt() {
        updatedAt = Instant.now();
    }
}
