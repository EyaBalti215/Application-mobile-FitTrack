package com.fittrack.dto.user;

public class ProfileResponse {
  private Long id;
  private String name;
  private String email;
  private Double weightKg;
  private Double heightCm;
  private Integer age;
  private String avatarUrl;

  public ProfileResponse(Long id, String name, String email, Double weightKg, Double heightCm, Integer age, String avatarUrl) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.weightKg = weightKg;
    this.heightCm = heightCm;
    this.age = age;
    this.avatarUrl = avatarUrl;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getEmail() {
    return email;
  }

  public Double getWeightKg() {
    return weightKg;
  }

  public Double getHeightCm() {
    return heightCm;
  }

  public Integer getAge() {
    return age;
  }

  public String getAvatarUrl() {
    return avatarUrl;
  }
}
