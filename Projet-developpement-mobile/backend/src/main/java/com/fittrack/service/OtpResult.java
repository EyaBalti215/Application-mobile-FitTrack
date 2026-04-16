package com.fittrack.service;

public class OtpResult {
  private final Long otpId;
  private final String code;

  public OtpResult(Long otpId, String code) {
    this.otpId = otpId;
    this.code = code;
  }

  public Long getOtpId() {
    return otpId;
  }

  public String getCode() {
    return code;
  }
}
