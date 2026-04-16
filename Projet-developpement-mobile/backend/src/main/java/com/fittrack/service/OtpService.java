package com.fittrack.service;

import com.fittrack.exception.ApiException;
import com.fittrack.model.OtpCode;
import com.fittrack.model.OtpType;
import com.fittrack.model.User;
import com.fittrack.repository.OtpCodeRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OtpService {
  private final OtpCodeRepository otpCodeRepository;
  private final PasswordEncoder passwordEncoder;
  private final int length;
  private final int ttlMinutes;
  private final SecureRandom random = new SecureRandom();

  public OtpService(
      OtpCodeRepository otpCodeRepository,
      PasswordEncoder passwordEncoder,
      @Value("${app.otp.length}") int length,
      @Value("${app.otp.ttl-minutes}") int ttlMinutes) {
    this.otpCodeRepository = otpCodeRepository;
    this.passwordEncoder = passwordEncoder;
    this.length = length;
    this.ttlMinutes = ttlMinutes;
  }

  public OtpResult createOtp(User user, OtpType type) {
    String code = generateCode();
    OtpCode otp = new OtpCode();
    otp.setUser(user);
    otp.setType(type);
    otp.setCodeHash(passwordEncoder.encode(code));
    otp.setExpiresAt(LocalDateTime.now().plusMinutes(ttlMinutes));
    otp = otpCodeRepository.save(otp);
    return new OtpResult(otp.getId(), code);
  }

  @Transactional
  public User verifyOtp(Long otpId, String code, OtpType type) {
    OtpCode otp = otpCodeRepository
        .findByIdAndType(otpId, type)
        .orElseThrow(() -> new ApiException("OTP not found", HttpStatus.NOT_FOUND));

    if (otp.isUsed()) {
      throw new ApiException("OTP already used", HttpStatus.BAD_REQUEST);
    }
    if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new ApiException("OTP expired", HttpStatus.BAD_REQUEST);
    }
    if (!passwordEncoder.matches(code, otp.getCodeHash())) {
      throw new ApiException("Invalid OTP", HttpStatus.BAD_REQUEST);
    }

    otp.setUsed(true);
    otpCodeRepository.save(otp);

    User user = otp.getUser();
    // Initialize lazy relation while persistence context is still active.
    user.getEmail();
    return user;
  }

  private String generateCode() {
    StringBuilder builder = new StringBuilder();
    for (int i = 0; i < length; i++) {
      builder.append(random.nextInt(10));
    }
    return builder.toString();
  }
}
