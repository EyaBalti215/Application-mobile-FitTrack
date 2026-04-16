package com.fittrack.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
  @NotBlank
  private String name;

  @Email
  @NotBlank
  private String email;

  @NotBlank
  @Size(min = 6)
  private String password;

  @NotNull
  private Double weightKg;

  @NotNull
  private Double heightCm;

  @NotNull
  private Integer age;

  private String avatarUrl;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Double getWeightKg() {
    return weightKg;
  }

  public void setWeightKg(Double weightKg) {
    this.weightKg = weightKg;
  }

  public Double getHeightCm() {
    return heightCm;
  }

  public void setHeightCm(Double heightCm) {
    this.heightCm = heightCm;
  }

  public Integer getAge() {
    return age;
  }

  public void setAge(Integer age) {
    this.age = age;
  }

  public String getAvatarUrl() {
    return avatarUrl;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }
}
