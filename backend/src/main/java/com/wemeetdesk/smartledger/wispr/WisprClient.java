package com.wemeetdesk.smartledger.wispr;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
            return extractText(response.getBody());
        } catch (Exception e) {
            if (e instanceof WisprException) throw (WisprException) e;
            throw new WisprException("Wispr transcription failed", e);
        }
    }

    /** Wispr answers with JSON; the transcript is in a text-like field. Plain-text bodies pass through. */
    private String extractText(String body) {
        if (body == null || body.isBlank()) return "";
        String trimmed = body.trim();
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return trimmed;
        try {
            JsonNode root = new ObjectMapper().readTree(trimmed);
            for (String field : new String[]{"text", "transcript", "transcription", "result", "data"}) {
                JsonNode n = root.get(field);
                if (n == null) continue;
                if (n.isTextual()) return n.asText();
                if (n.isObject()) {
                    for (String inner : new String[]{"text", "transcript"}) {
                        if (n.has(inner) && n.get(inner).isTextual()) return n.get(inner).asText();
                    }
                }
            }
        } catch (IOException ignored) {
            // fall through to a clear error
        }
        throw new WisprException("Wispr replied in a format we could not read");
    }
}
