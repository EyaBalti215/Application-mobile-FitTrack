package com.fittrack.service;

import com.fittrack.dto.stats.StatsResponse;
import com.fittrack.model.Activity;
import com.fittrack.repository.ActivityRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StatsService {
  private final ActivityRepository activityRepository;

  public StatsService(ActivityRepository activityRepository) {
    this.activityRepository = activityRepository;
  }

  public StatsResponse getStats(Long userId) {
    List<Activity> allActivities = activityRepository.findByUserIdOrderByDateDesc(userId);

    double totalCalories = 0.0;
    double totalDistance = 0.0;
    double totalDuration = 0.0;

    for (Activity activity : allActivities) {
      totalCalories += activity.getCalories();
      totalDuration += activity.getDurationMinutes();
      if (activity.getDistanceKm() != null) {
        totalDistance += activity.getDistanceKm();
      }
    }

    List<Double> weeklyCalories = buildWeeklyCalories(userId);

    return new StatsResponse(totalCalories, totalDistance, totalDuration, weeklyCalories);
  }

  private List<Double> buildWeeklyCalories(Long userId) {
    LocalDate end = LocalDate.now();
    LocalDate start = end.minusDays(6);
    List<Activity> weekActivities = activityRepository.findByUserIdAndDateBetween(userId, start, end);

    List<Double> dailyTotals = new ArrayList<>();
    for (int i = 0; i < 7; i++) {
      dailyTotals.add(0.0);
    }

    for (Activity activity : weekActivities) {
      int index = (int) (activity.getDate().toEpochDay() - start.toEpochDay());
      if (index >= 0 && index < 7) {
        dailyTotals.set(index, dailyTotals.get(index) + activity.getCalories());
      }
    }

    return dailyTotals;
  }
}
