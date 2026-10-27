package com.wemeetdesk.smartledger.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record RegisterRequest(
            @Email(message = "Invalid email format")
            @NotBlank(message = "Email is required")
            String email,
            @NotBlank(message = "Password is required")
            @Size(min = 6, message = "Password must be at least 6 characters")
            String password
    ) {}

    public record LoginRequest(
            @Email(message = "Invalid email format")
            @NotBlank(message = "Email is required")
            String email,
            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record UserDto(String id, String email) {}

    public record AuthResponse(String token, UserDto user) {}

    public record MeResponse(UserDto user) {}
}
