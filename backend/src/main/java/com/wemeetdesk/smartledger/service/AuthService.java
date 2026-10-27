package com.wemeetdesk.smartledger.service;

import com.wemeetdesk.smartledger.dto.AuthDtos;
import com.wemeetdesk.smartledger.model.User;
import com.wemeetdesk.smartledger.repository.UserRepository;
import com.wemeetdesk.smartledger.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
        String email = req.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .passwordHash(passwordEncoder.encode(req.password()))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthDtos.AuthResponse(token, new AuthDtos.UserDto(user.getId(), user.getEmail()));
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        String email = req.email().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthDtos.AuthResponse(token, new AuthDtos.UserDto(user.getId(), user.getEmail()));
    }

    public AuthDtos.UserDto me(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token"));
        return new AuthDtos.UserDto(user.getId(), user.getEmail());
    }
}
