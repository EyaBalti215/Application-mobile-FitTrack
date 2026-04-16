package com.fittrack.controller;

import com.fittrack.dto.stats.NotificationResponse;
import com.fittrack.security.UserPrincipal;
import com.fittrack.service.NotificationService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {
  private final NotificationService notificationService;

  public NotificationsController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping
  public List<NotificationResponse> listNotifications(
      @AuthenticationPrincipal UserPrincipal principal) {
    return notificationService.listNotifications(principal.getId());
  }
}
