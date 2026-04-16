package com.fittrack.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
  @NotNull
  private Long otpId;

  @NotBlank
  private String code;

  @NotBlank
  @Size(min = 6)
  private String newPassword;

  public Long getOtpId() {
    return otpId;
  }

  public void setOtpId(Long otpId) {
    this.otpId = otpId;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getNewPassword() {
    return newPassword;
  }

  public void setNewPassword(String newPassword) {
    this.newPassword = newPassword;
  }
}
