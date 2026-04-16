package com.fittrack.controller;

import com.fittrack.dto.stats.StatsResponse;
import com.fittrack.security.UserPrincipal;
import com.fittrack.service.StatsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
  private final StatsService statsService;

  public StatsController(StatsService statsService) {
    this.statsService = statsService;
  }

  @GetMapping
  public StatsResponse getStats(@AuthenticationPrincipal UserPrincipal principal) {
    return statsService.getStats(principal.getId());
  }
}
