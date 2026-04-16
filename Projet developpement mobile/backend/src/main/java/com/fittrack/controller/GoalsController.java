package com.fittrack.controller;

import com.fittrack.dto.goal.GoalRequest;
import com.fittrack.dto.goal.GoalResponse;
import com.fittrack.security.UserPrincipal;
import com.fittrack.service.GoalService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
public class GoalsController {
  private final GoalService goalService;

  public GoalsController(GoalService goalService) {
    this.goalService = goalService;
  }

  @GetMapping
  public List<GoalResponse> listGoals(@AuthenticationPrincipal UserPrincipal principal) {
    return goalService.listGoals(principal.getId());
  }

  @PostMapping
  public GoalResponse createGoal(
      @AuthenticationPrincipal UserPrincipal principal,
      @Valid @RequestBody GoalRequest request) {
    return goalService.createGoal(principal.getId(), request);
  }

  @PutMapping("/{id}")
  public GoalResponse updateGoal(
      @AuthenticationPrincipal UserPrincipal principal,
      @PathVariable Long id,
      @Valid @RequestBody GoalRequest request) {
    return goalService.updateGoal(principal.getId(), id, request);
  }

  @DeleteMapping("/{id}")
  public void deleteGoal(
      @AuthenticationPrincipal UserPrincipal principal,
      @PathVariable Long id) {
    goalService.deleteGoal(principal.getId(), id);
  }
}
