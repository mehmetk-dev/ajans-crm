package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.CreateSurveyRequest;
import com.fogistanbul.crm.dto.SurveyResponse;
import com.fogistanbul.crm.security.CurrentUser;
import com.fogistanbul.crm.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/surveys")
@RequiredArgsConstructor
public class ClientSurveyController {

    private final SurveyService surveyService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<SurveyResponse> submit(
            Authentication auth,
            @Valid @RequestBody CreateSurveyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(surveyService.submitSurvey(currentUser.id(auth), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SurveyResponse>> getMySurveys(Authentication auth) {
        return ResponseEntity.ok(surveyService.getMySurveys(currentUser.id(auth)));
    }
}
