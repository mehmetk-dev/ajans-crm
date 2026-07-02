package com.fogistanbul.crm.repository;

import com.fogistanbul.crm.entity.MailSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MailSettingsRepository extends JpaRepository<MailSettings, Short> {
}
