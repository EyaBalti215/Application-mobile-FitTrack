package com.fittrack.dto.stats;

import java.util.List;

public class StatsResponse {
  private Double totalCalories;
  private Double totalDistanceKm;
  private Double totalDurationMinutes;
  private List<Double> weeklyCalories;

  public StatsResponse(Double totalCalories, Double totalDistanceKm, Double totalDurationMinutes, List<Double> weeklyCalories) {
    this.totalCalories = totalCalories;
    this.totalDistanceKm = totalDistanceKm;
    this.totalDurationMinutes = totalDurationMinutes;
    this.weeklyCalories = weeklyCalories;
  }

  public Double getTotalCalories() {
    return totalCalories;
  }

  public Double getTotalDistanceKm() {
    return totalDistanceKm;
  }

  public Double getTotalDurationMinutes() {
    return totalDurationMinutes;
  }

  public List<Double> getWeeklyCalories() {
    return weeklyCalories;
  }
}
