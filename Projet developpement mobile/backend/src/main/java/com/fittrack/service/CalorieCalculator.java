package com.fittrack.service;

import com.fittrack.model.ActivityType;
import java.util.EnumMap;
import java.util.Map;

public class CalorieCalculator {
  private static final Map<ActivityType, Double> MET_VALUES = new EnumMap<>(ActivityType.class);

  static {
    MET_VALUES.put(ActivityType.RUNNING, 9.8);
    MET_VALUES.put(ActivityType.WALKING, 3.5);
    MET_VALUES.put(ActivityType.CYCLING, 7.5);
    MET_VALUES.put(ActivityType.GYM, 6.0);
  }

  private CalorieCalculator() {}

  public static double calculate(ActivityType type, double weightKg, double durationMinutes) {
    double met = MET_VALUES.getOrDefault(type, 3.0);
    double hours = durationMinutes / 60.0;
    return met * weightKg * hours;
  }
}
