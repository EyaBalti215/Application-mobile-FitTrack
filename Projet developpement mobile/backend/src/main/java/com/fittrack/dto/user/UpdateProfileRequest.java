package com.fittrack.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpdateProfileRequest {
  @NotBlank
  private String name;

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
