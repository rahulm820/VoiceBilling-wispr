package com.wemeetdesk.smartledger.wispr;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class WisprClient {
    @Value("${wispr.key:}")
    private String key;

    @Value("${wispr.base-url:https://api.wispr.ai}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String transcribe(MultipartFile file) {
        if (key == null || key.isBlank()) {
            throw new WisprException("Wispr is not configured");
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBearerAuth(key);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            body.add("audio", file.getResource());
            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(baseUrl + "/v1/transcribe", HttpMethod.POST, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new WisprException("Wispr transcription failed");
            }
            return response.getBody() == null ? "" : response.getBody();
        } catch (Exception e) {
            if (e instanceof WisprException) throw (WisprException) e;
            throw new WisprException("Wispr transcription failed", e);
        }
    }
}
