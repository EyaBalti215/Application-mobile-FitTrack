package com.fittrack.service;

import com.fittrack.dto.auth.AuthResponse;
import com.fittrack.dto.auth.ForgotPasswordRequest;
import com.fittrack.dto.auth.LoginRequest;
import com.fittrack.dto.auth.OtpStartResponse;
import com.fittrack.dto.auth.OtpVerifyRequest;
import com.fittrack.dto.auth.RegisterRequest;
import com.fittrack.dto.auth.ResetPasswordRequest;
import com.fittrack.exception.ApiException;
import com.fittrack.model.OtpType;
import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import com.fittrack.security.JwtService;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final OtpService otpService;
  private final EmailService emailService;
  private final boolean returnOtpCodeInResponse;
  private final boolean failOnEmailError;
  private final String passwordResetUrlTemplate;
  private final boolean returnResetLinkInResponse;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      OtpService otpService,
      EmailService emailService,
      @Value("${app.otp.return-code-in-response:false}") boolean returnOtpCodeInResponse,
      @Value("${app.mail.fail-on-error:true}") boolean failOnEmailError,
      @Value("${app.password-reset.url-template}") String passwordResetUrlTemplate,
      @Value("${app.password-reset.return-link-in-response:false}") boolean returnResetLinkInResponse) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.otpService = otpService;
    this.emailService = emailService;
    this.returnOtpCodeInResponse = returnOtpCodeInResponse;
    this.failOnEmailError = failOnEmailError;
    this.passwordResetUrlTemplate = passwordResetUrlTemplate;
    this.returnResetLinkInResponse = returnResetLinkInResponse;
  }

  public void register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new ApiException("Email already registered", HttpStatus.BAD_REQUEST);
    }

    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setWeightKg(request.getWeightKg());
    user.setHeightCm(request.getHeightCm());
    user.setAge(request.getAge());
    user.setAvatarUrl(request.getAvatarUrl());

    userRepository.save(user);
  }

  public OtpStartResponse login(LoginRequest request) {
    User user = userRepository
        .findByEmail(request.getEmail())
        .orElseThrow(() -> new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    OtpResult otp = otpService.createOtp(user, OtpType.LOGIN);
    boolean emailSent = emailService.sendOtp(user.getEmail(), otp.getCode(), OtpType.LOGIN);
    if (!emailSent && failOnEmailError) {
      throw new ApiException("Unable to send OTP email", HttpStatus.SERVICE_UNAVAILABLE);
    }
    boolean exposeOtpCode = returnOtpCodeInResponse;

    return new OtpStartResponse(
      otp.getOtpId(),
      emailSent ? "OTP sent to email" : "OTP generated (email delivery unavailable)",
      exposeOtpCode ? otp.getCode() : null);
  }

  public AuthResponse verifyOtp(OtpVerifyRequest request) {
    User user = otpService.verifyOtp(request.getOtpId(), request.getCode(), OtpType.LOGIN);
    String token = jwtService.generateToken(user);
    return new AuthResponse(token, user.getId(), user.getName(), user.getEmail());
  }

  public OtpStartResponse forgotPassword(ForgotPasswordRequest request) {
    User user = userRepository
        .findByEmail(request.getEmail())
        .orElseThrow(() -> new ApiException("Email not found", HttpStatus.NOT_FOUND));

    OtpResult otp = otpService.createOtp(user, OtpType.PASSWORD_RESET);
    String resetLink = buildResetLink(otp.getOtpId(), otp.getCode());
    boolean emailSent = emailService.sendPasswordResetLink(user.getEmail(), otp.getCode(), resetLink);
    if (!emailSent && failOnEmailError) {
      throw new ApiException("Unable to send reset email", HttpStatus.SERVICE_UNAVAILABLE);
    }
    boolean exposeResetCode = returnOtpCodeInResponse;
    boolean exposeResetLink = returnResetLinkInResponse;

    return new OtpStartResponse(
        otp.getOtpId(),
        emailSent
            ? "Reset code and link sent to email"
            : "Reset code generated (email delivery unavailable)",
      exposeResetCode ? otp.getCode() : null,
      exposeResetLink ? resetLink : null);
  }

  private String buildResetLink(Long otpId, String code) {
    String encodedCode = URLEncoder.encode(code, StandardCharsets.UTF_8);
    return passwordResetUrlTemplate
        .replace("{otpId}", String.valueOf(otpId))
        .replace("{code}", encodedCode);
  }

  public void resetPassword(ResetPasswordRequest request) {
    User user = otpService.verifyOtp(request.getOtpId(), request.getCode(), OtpType.PASSWORD_RESET);
    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
  }
}
