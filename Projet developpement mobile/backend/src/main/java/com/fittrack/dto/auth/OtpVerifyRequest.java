package com.fittrack.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OtpVerifyRequest {
  @NotNull
  private Long otpId;

  @NotBlank
  private String code;

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
}
