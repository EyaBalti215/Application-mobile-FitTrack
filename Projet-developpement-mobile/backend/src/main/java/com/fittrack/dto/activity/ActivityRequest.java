package com.fittrack.dto.activity;

import com.fittrack.model.ActivityType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ActivityRequest {
  @NotNull
  private ActivityType type;

  @NotNull
  private Double durationMinutes;

  private Double distanceKm;

  @NotNull
  private LocalDate date;

  private String notes;

  public ActivityType getType() {
    return type;
  }

  public void setType(ActivityType type) {
    this.type = type;
  }

  public Double getDurationMinutes() {
    return durationMinutes;
  }

  public void setDurationMinutes(Double durationMinutes) {
    this.durationMinutes = durationMinutes;
  }

  public Double getDistanceKm() {
    return distanceKm;
  }

  public void setDistanceKm(Double distanceKm) {
    this.distanceKm = distanceKm;
  }

  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
