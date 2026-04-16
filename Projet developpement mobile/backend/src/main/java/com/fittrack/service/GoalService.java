package com.fittrack.service;

import com.fittrack.dto.goal.GoalRequest;
import com.fittrack.dto.goal.GoalResponse;
import com.fittrack.exception.ApiException;
import com.fittrack.model.Goal;
import com.fittrack.model.User;
import com.fittrack.repository.GoalRepository;
import com.fittrack.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class GoalService {
  private final GoalRepository goalRepository;
  private final UserRepository userRepository;

  public GoalService(GoalRepository goalRepository, UserRepository userRepository) {
    this.goalRepository = goalRepository;
    this.userRepository = userRepository;
  }

  public GoalResponse createGoal(Long userId, GoalRequest request) {
    User user = getUser(userId);
    Goal goal = new Goal();
    goal.setUser(user);
    goal.setType(request.getType());
    goal.setActivityType(request.getActivityType());
    goal.setPeriod(request.getPeriod());
    goal.setTargetValue(request.getTargetValue());
    goal.setStartDate(request.getStartDate());
    goal.setEndDate(request.getEndDate());
    goalRepository.save(goal);
    return toResponse(goal);
  }

  public List<GoalResponse> listGoals(Long userId) {
    return goalRepository.findByUserId(userId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request) {
    Goal goal = getUserGoal(userId, goalId);
    goal.setType(request.getType());
    goal.setActivityType(request.getActivityType());
    goal.setPeriod(request.getPeriod());
    goal.setTargetValue(request.getTargetValue());
    goal.setStartDate(request.getStartDate());
    goal.setEndDate(request.getEndDate());
    goalRepository.save(goal);
    return toResponse(goal);
  }

  public void deleteGoal(Long userId, Long goalId) {
    Goal goal = getUserGoal(userId, goalId);
    goalRepository.delete(goal);
  }

  private Goal getUserGoal(Long userId, Long goalId) {
    Goal goal = goalRepository.findById(goalId)
        .orElseThrow(() -> new ApiException("Goal not found", HttpStatus.NOT_FOUND));
    if (!goal.getUser().getId().equals(userId)) {
      throw new ApiException("Access denied", HttpStatus.FORBIDDEN);
    }
    return goal;
  }

  private User getUser(Long userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
  }

  private GoalResponse toResponse(Goal goal) {
    return new GoalResponse(
        goal.getId(),
        goal.getType(),
        goal.getActivityType(),
        goal.getPeriod(),
        goal.getTargetValue(),
        goal.getStartDate(),
        goal.getEndDate());
  }
}
