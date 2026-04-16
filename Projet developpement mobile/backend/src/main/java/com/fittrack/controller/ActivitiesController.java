package com.fittrack.controller;

import com.fittrack.dto.activity.ActivityRequest;
import com.fittrack.dto.activity.ActivityResponse;
import com.fittrack.security.UserPrincipal;
import com.fittrack.service.ActivityService;
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
@RequestMapping("/api/activities")
public class ActivitiesController {
  private final ActivityService activityService;

  public ActivitiesController(ActivityService activityService) {
    this.activityService = activityService;
  }

  @GetMapping
  public List<ActivityResponse> listActivities(@AuthenticationPrincipal UserPrincipal principal) {
    return activityService.listActivities(principal.getId());
  }

  @PostMapping
  public ActivityResponse createActivity(
      @AuthenticationPrincipal UserPrincipal principal,
      @Valid @RequestBody ActivityRequest request) {
    return activityService.createActivity(principal.getId(), request);
  }

  @PutMapping("/{id}")
  public ActivityResponse updateActivity(
      @AuthenticationPrincipal UserPrincipal principal,
      @PathVariable Long id,
      @Valid @RequestBody ActivityRequest request) {
    return activityService.updateActivity(principal.getId(), id, request);
  }

  @DeleteMapping("/{id}")
  public void deleteActivity(
      @AuthenticationPrincipal UserPrincipal principal,
      @PathVariable Long id) {
    activityService.deleteActivity(principal.getId(), id);
  }
}
