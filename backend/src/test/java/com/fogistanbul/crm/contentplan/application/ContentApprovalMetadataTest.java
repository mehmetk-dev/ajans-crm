package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.contentplan.dto.ReviewApprovalRequest;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ContentApprovalMetadataTest {

    private final ContentApprovalMetadata metadata = new ContentApprovalMetadata();

    @Test
    void parsesLegacyMetadataFormat() {
        UUID shootId = UUID.randomUUID();

        ContentApprovalMetadata.Details details = metadata.parse(
                "Baslik||Aciklama||2026-06-12||13:30||Studyo||" + shootId);

        assertEquals("Baslik", details.shootTitle());
        assertEquals("2026-06-12", details.shootDate());
        assertEquals(shootId, details.existingShootId());
    }

    @Test
    void blankFieldsBecomeNull() {
        ContentApprovalMetadata.Details details = metadata.parse("||||||||||");

        assertNull(details.shootTitle());
        assertNull(details.existingShootId());
    }

    @Test
    void reviewerValuesOverrideClientMetadata() {
        ReviewApprovalRequest review = new ReviewApprovalRequest();
        review.setShootTitle("Yonetici basligi");

        ContentApprovalMetadata.Details merged = metadata.merge(
                metadata.parse("Musteri basligi||||||||||"), review);

        assertEquals("Yonetici basligi", merged.shootTitle());
    }
}
