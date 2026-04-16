package com.fittrack.service;

import com.fittrack.dto.activity.ActivityRequest;
import com.fittrack.dto.activity.ActivityResponse;
import com.fittrack.exception.ApiException;
import com.fittrack.model.Activity;
import com.fittrack.model.User;
import com.fittrack.repository.ActivityRepository;
import com.fittrack.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ActivityService {
  private final ActivityRepository activityRepository;
  private final UserRepository userRepository;

  public ActivityService(ActivityRepository activityRepository, UserRepository userRepository) {
    this.activityRepository = activityRepository;
    this.userRepository = userRepository;
  }

  public ActivityResponse createActivity(Long userId, ActivityRequest request) {
    User user = getUser(userId);
    Activity activity = new Activity();
    activity.setUser(user);
    activity.setType(request.getType());
    activity.setDurationMinutes(request.getDurationMinutes());
    activity.setDistanceKm(request.getDistanceKm());
    activity.setDate(request.getDate());
    activity.setNotes(request.getNotes());

    double weight = user.getWeightKg() == null ? 70.0 : user.getWeightKg();
    double calories = CalorieCalculator.calculate(request.getType(), weight, request.getDurationMinutes());
    activity.setCalories(calories);

    activityRepository.save(activity);
    return toResponse(activity);
  }

  public List<ActivityResponse> listActivities(Long userId) {
    return activityRepository.findByUserIdOrderByDateDesc(userId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public ActivityResponse updateActivity(Long userId, Long activityId, ActivityRequest request) {
    Activity activity = getUserActivity(userId, activityId);
    activity.setType(request.getType());
    activity.setDurationMinutes(request.getDurationMinutes());
    activity.setDistanceKm(request.getDistanceKm());
    activity.setDate(request.getDate());
    activity.setNotes(request.getNotes());

    double weight = activity.getUser().getWeightKg() == null ? 70.0 : activity.getUser().getWeightKg();
    double calories = CalorieCalculator.calculate(request.getType(), weight, request.getDurationMinutes());
    activity.setCalories(calories);

    activityRepository.save(activity);
    return toResponse(activity);
  }

  public void deleteActivity(Long userId, Long activityId) {
    Activity activity = getUserActivity(userId, activityId);
    activityRepository.delete(activity);
  }

  private Activity getUserActivity(Long userId, Long activityId) {
    Activity activity = activityRepository.findById(activityId)
        .orElseThrow(() -> new ApiException("Activity not found", HttpStatus.NOT_FOUND));
    if (!activity.getUser().getId().equals(userId)) {
      throw new ApiException("Access denied", HttpStatus.FORBIDDEN);
    }
    return activity;
  }

  private User getUser(Long userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
  }

  private ActivityResponse toResponse(Activity activity) {
    return new ActivityResponse(
        activity.getId(),
        activity.getType(),
        activity.getDurationMinutes(),
        activity.getDistanceKm(),
        activity.getDate(),
        activity.getNotes(),
        activity.getCalories());
  }
}
