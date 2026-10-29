package com.wemeetdesk.smartledger.controller;

import com.wemeetdesk.smartledger.security.CurrentUserService;
import com.wemeetdesk.smartledger.service.WisprParserService;
import com.wemeetdesk.smartledger.wispr.WisprClient;
import com.wemeetdesk.smartledger.wispr.WisprException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
public class VoiceController {
    private final WisprClient wisprClient;
    private final WisprParserService parserService;
    private final CurrentUserService currentUserService;

    @PostMapping("/ledger")
    public ResponseEntity<Map<String, Object>> ledger(@RequestParam("audio") MultipartFile audio) {
        String userId = currentUserService.getCurrentUserId();
        try {
            String transcript = wisprClient.transcribe(audio);
            List<WisprParserService.ParsedItem> parsed = parserService.parse(transcript, userId);
            List<Map<String, Object>> items = new ArrayList<>();
            for (WisprParserService.ParsedItem p : parsed) {
                Map<String, Object> m = new HashMap<>();
                m.put("name", p.name());
                m.put("quantity", p.quantity());
                m.put("unit", p.unit());
                m.put("price", p.price() == null ? BigDecimal.ZERO : p.price());
                m.put("priceFromSheet", p.priceFromSheet());
                items.add(m);
            }
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("transcript", WisprParserService.cleanTranscript(transcript));
            res.put("items", items);
            return ResponseEntity.ok(res);
        } catch (WisprException e) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", false);
            res.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(res);
        }
    }

    @PostMapping("/bill")
    public ResponseEntity<Map<String, Object>> bill(@RequestParam("audio") MultipartFile audio) {
        return ledger(audio);
    }

    @PostMapping("/text")
    public ResponseEntity<Map<String, Object>> text(@RequestBody Map<String, String> body) {
        String userId = currentUserService.getCurrentUserId();
        String text = body.get("text");
        List<WisprParserService.ParsedItem> parsed = parserService.parse(text, userId);
        List<Map<String, Object>> items = new ArrayList<>();
        for (WisprParserService.ParsedItem p : parsed) {
            Map<String, Object> m = new HashMap<>();
            m.put("name", p.name());
            m.put("quantity", p.quantity());
            m.put("unit", p.unit());
            m.put("price", p.price() == null ? BigDecimal.ZERO : p.price());
                m.put("priceFromSheet", p.priceFromSheet());
            items.add(m);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("transcript", WisprParserService.cleanTranscript(text));
        res.put("items", items);
        return ResponseEntity.ok(res);
    }
}
