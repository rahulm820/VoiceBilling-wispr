package com.wemeetdesk.smartledger.controller;

import com.wemeetdesk.smartledger.dto.AuthDtos;
import com.wemeetdesk.smartledger.security.CurrentUserService;
import com.wemeetdesk.smartledger.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    public ResponseEntity<AuthDtos.AuthResponse> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDtos.MeResponse> me() {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(new AuthDtos.MeResponse(authService.me(userId)));
    }
}
