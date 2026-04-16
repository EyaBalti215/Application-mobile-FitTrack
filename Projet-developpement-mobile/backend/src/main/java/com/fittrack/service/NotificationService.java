package com.fittrack.service;

import com.fittrack.dto.stats.NotificationResponse;
import com.fittrack.model.Activity;
import com.fittrack.model.Goal;
import com.fittrack.model.GoalPeriod;
import com.fittrack.model.GoalType;
import com.fittrack.model.User;
import com.fittrack.repository.ActivityRepository;
import com.fittrack.repository.GoalRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

  private final ActivityRepository activityRepository;
  private final GoalRepository goalRepository;
  private final UserService userService;

  public NotificationService(
      ActivityRepository activityRepository,
      GoalRepository goalRepository,
      UserService userService) {
    this.activityRepository = activityRepository;
    this.goalRepository = goalRepository;
    this.userService = userService;
  }

  public List<NotificationResponse> listNotifications(Long userId) {
    User user = userService.getUser(userId);
    List<Activity> activities = activityRepository.findByUserIdOrderByDateDesc(userId);
    List<Goal> goals = goalRepository.findByUserId(userId);

    List<NotificationResponse> notifications = new ArrayList<>();
    appendProfileNotifications(notifications, user);
    appendActivityNotifications(notifications, activities);
    appendGoalNotifications(notifications, goals, activities);

    notifications.sort(Comparator.comparing(NotificationResponse::getCreatedAt).reversed());
    return notifications;
  }

  private void appendProfileNotifications(List<NotificationResponse> notifications, User user) {
    boolean missingBodyData = user.getWeightKg() == null || user.getHeightCm() == null || user.getAge() == null;
    boolean missingAvatar = user.getAvatarUrl() == null || user.getAvatarUrl().isBlank();

    if (missingBodyData || missingAvatar) {
      notifications.add(
          new NotificationResponse(
              "profile-completion",
              "REMINDER",
              "Complete your profile",
              "Add your profile photo and body info to improve calorie calculations.",
              user.getCreatedAt().plusMinutes(5),
              false));
    } else {
      notifications.add(
          new NotificationResponse(
              "profile-ready",
              "SUCCESS",
              "Profile updated",
              "Your profile is complete and ready for personalized recommendations.",
              LocalDateTime.now().minusHours(2),
              false));
    }
  }

  private void appendActivityNotifications(List<NotificationResponse> notifications, List<Activity> activities) {
    if (activities.isEmpty()) {
      notifications.add(
          new NotificationResponse(
              "first-activity",
              "INFO",
              "Start your first workout",
              "No activity recorded yet. Add one workout to unlock progress insights.",
              LocalDateTime.now().minusHours(1),
              false));
      return;
    }

    Activity lastActivity = activities.get(0);
    notifications.add(
        new NotificationResponse(
            "latest-activity-" + lastActivity.getId(),
            "INFO",
            "Latest activity saved",
            String.format(
                "%s on %s (%d kcal)",
                lastActivity.getType(),
                lastActivity.getDate().format(DATE_FORMATTER),
                Math.round(lastActivity.getCalories())),
            lastActivity.getCreatedAt(),
            false));

    long last7DaysCount = activities.stream()
        .filter(activity -> !activity.getDate().isBefore(LocalDate.now().minusDays(6)))
        .count();

    if (last7DaysCount >= 4) {
      notifications.add(
          new NotificationResponse(
              "weekly-streak",
              "SUCCESS",
              "Strong weekly consistency",
              String.format("You completed %d activities in the last 7 days.", last7DaysCount),
              LocalDateTime.now().minusMinutes(45),
              false));
    }
  }

  private void appendGoalNotifications(
      List<NotificationResponse> notifications,
      List<Goal> goals,
      List<Activity> activities) {
    if (goals.isEmpty()) {
      notifications.add(
          new NotificationResponse(
              "no-goals",
              "REMINDER",
              "Set your first goal",
              "Goals help you track progress and receive smarter reminders.",
              LocalDateTime.now().minusMinutes(20),
              false));
      return;
    }

    double totalDistance = activities.stream()
        .mapToDouble(item -> item.getDistanceKm() == null ? 0 : item.getDistanceKm())
        .sum();

    double totalCalories = activities.stream()
        .mapToDouble(item -> item.getCalories() == null ? 0 : item.getCalories())
        .sum();

    goals.stream()
        .limit(3)
        .forEach(goal -> {
          double currentValue = computeCurrentValue(goal, totalDistance, totalCalories);
          double target = goal.getTargetValue() == null ? 0 : goal.getTargetValue();
          if (target <= 0) {
            return;
          }

          int completionPercent = (int) Math.min(100, Math.round((currentValue / target) * 100));
          String message = String.format(
              "%s goal is %d%% complete (%s / %s)",
              goal.getType(),
              completionPercent,
              formatNumber(currentValue),
              formatNumber(target));

          notifications.add(
              new NotificationResponse(
                  "goal-progress-" + goal.getId(),
                  completionPercent >= 100 ? "SUCCESS" : "INFO",
                  "Goal progress",
                  message,
                  goal.getCreatedAt().plusMinutes(15),
                  false));
        });
  }

  private double computeCurrentValue(Goal goal, double totalDistance, double totalCalories) {
    if (goal.getType() == GoalType.DISTANCE_KM) {
      return totalDistance;
    }
    if (goal.getType() == GoalType.CALORIES) {
      return totalCalories;
    }
    if (goal.getType() == GoalType.ACTIVITIES_COUNT) {
      return activityCountByPeriod(goal);
    }
    return 0;
  }

  private double activityCountByPeriod(Goal goal) {
    LocalDate start = goal.getStartDate();
    LocalDate end = goal.getEndDate();

    if (start == null) {
      return 0;
    }
    if (end == null) {
      end = guessEndDate(goal);
    }

    return activityRepository.findByUserIdAndDateBetween(goal.getUser().getId(), start, end).size();
  }

  private LocalDate guessEndDate(Goal goal) {
    GoalPeriod period = goal.getPeriod();
    if (period == GoalPeriod.WEEKLY) {
      return goal.getStartDate().plusDays(6);
    }
    if (period == GoalPeriod.MONTHLY) {
      return goal.getStartDate().plusMonths(1).minusDays(1);
    }
    return goal.getStartDate();
  }

  private String formatNumber(double value) {
    if (Math.abs(value - Math.round(value)) < 0.001) {
      return String.valueOf(Math.round(value));
    }
    return String.format("%.1f", value);
  }
}
