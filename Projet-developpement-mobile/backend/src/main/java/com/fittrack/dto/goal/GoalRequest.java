package com.fittrack.dto.goal;

import com.fittrack.model.GoalPeriod;
import com.fittrack.model.GoalType;
import com.fittrack.model.ActivityType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class GoalRequest {
  @NotNull
  private GoalType type;

  private ActivityType activityType;

  @NotNull
  private GoalPeriod period;

  @NotNull
  private Double targetValue;

  @NotNull
  private LocalDate startDate;

  private LocalDate endDate;

  public GoalType getType() {
    return type;
  }

  public void setType(GoalType type) {
    this.type = type;
  }

  public ActivityType getActivityType() {
    return activityType;
  }

  public void setActivityType(ActivityType activityType) {
    this.activityType = activityType;
  }

  public GoalPeriod getPeriod() {
    return period;
  }

  public void setPeriod(GoalPeriod period) {
    this.period = period;
  }

  public Double getTargetValue() {
    return targetValue;
  }

  public void setTargetValue(Double targetValue) {
    this.targetValue = targetValue;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }
}
