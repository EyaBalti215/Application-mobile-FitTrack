package com.fittrack.dto.auth;

public class OtpStartResponse {
  private Long otpId;
  private String message;
  private String otpCode;
  private String resetLink;

  public OtpStartResponse(Long otpId, String message) {
    this.otpId = otpId;
    this.message = message;
    this.otpCode = null;
    this.resetLink = null;
  }

  public OtpStartResponse(Long otpId, String message, String otpCode) {
    this.otpId = otpId;
    this.message = message;
    this.otpCode = otpCode;
    this.resetLink = null;
  }

  public OtpStartResponse(Long otpId, String message, String otpCode, String resetLink) {
    this.otpId = otpId;
    this.message = message;
    this.otpCode = otpCode;
    this.resetLink = resetLink;
  }

  public Long getOtpId() {
    return otpId;
  }

  public String getMessage() {
    return message;
  }

  public String getOtpCode() {
    return otpCode;
  }

  public String getResetLink() {
    return resetLink;
  }
}
