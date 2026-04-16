package com.fittrack.dto.activity;

import com.fittrack.model.ActivityType;
import java.time.LocalDate;

public class ActivityResponse {
  private Long id;
  private ActivityType type;
  private Double durationMinutes;
  private Double distanceKm;
  private LocalDate date;
  private String notes;
  private Double calories;

  public ActivityResponse(Long id, ActivityType type, Double durationMinutes, Double distanceKm, LocalDate date, String notes, Double calories) {
    this.id = id;
    this.type = type;
    this.durationMinutes = durationMinutes;
    this.distanceKm = distanceKm;
    this.date = date;
    this.notes = notes;
    this.calories = calories;
  }

  public Long getId() {
    return id;
  }

  public ActivityType getType() {
    return type;
  }

  public Double getDurationMinutes() {
    return durationMinutes;
  }

  public Double getDistanceKm() {
    return distanceKm;
  }

  public LocalDate getDate() {
    return date;
  }

  public String getNotes() {
    return notes;
  }

  public Double getCalories() {
    return calories;
  }
}
