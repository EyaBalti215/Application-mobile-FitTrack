package com.fittrack.controller;

import com.fittrack.dto.auth.AuthResponse;
import com.fittrack.dto.auth.ForgotPasswordRequest;
import com.fittrack.dto.auth.LoginRequest;
import com.fittrack.dto.auth.OtpStartResponse;
import com.fittrack.dto.auth.OtpVerifyRequest;
import com.fittrack.dto.auth.RegisterRequest;
import com.fittrack.dto.auth.ResetPasswordRequest;
import com.fittrack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
    authService.register(request);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/login")
  public ResponseEntity<OtpStartResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/verify-otp")
  public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
    return ResponseEntity.ok(authService.verifyOtp(request));
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<OtpStartResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    return ResponseEntity.ok(authService.forgotPassword(request));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ResponseEntity.ok().build();
  }
}
