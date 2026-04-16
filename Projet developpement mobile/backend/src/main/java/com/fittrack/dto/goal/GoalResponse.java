package com.fittrack.dto.goal;

import com.fittrack.model.GoalPeriod;
import com.fittrack.model.GoalType;
import com.fittrack.model.ActivityType;
import java.time.LocalDate;

public class GoalResponse {
  private Long id;
  private GoalType type;
  private ActivityType activityType;
  private GoalPeriod period;
  private Double targetValue;
  private LocalDate startDate;
  private LocalDate endDate;

  public GoalResponse(Long id, GoalType type, ActivityType activityType, GoalPeriod period, Double targetValue, LocalDate startDate, LocalDate endDate) {
    this.id = id;
    this.type = type;
    this.activityType = activityType;
    this.period = period;
    this.targetValue = targetValue;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public Long getId() {
    return id;
  }

  public GoalType getType() {
    return type;
  }

  public ActivityType getActivityType() {
    return activityType;
  }

  public GoalPeriod getPeriod() {
    return period;
  }

  public Double getTargetValue() {
    return targetValue;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public LocalDate getEndDate() {
    return endDate;
  }
}
