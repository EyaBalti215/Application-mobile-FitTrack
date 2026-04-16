package com.fittrack.dto.stats;

import java.time.LocalDateTime;

public class NotificationResponse {
  private String id;
  private String type;
  private String title;
  private String message;
  private LocalDateTime createdAt;
  private boolean read;

  public NotificationResponse(
      String id,
      String type,
      String title,
      String message,
      LocalDateTime createdAt,
      boolean read) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.message = message;
    this.createdAt = createdAt;
    this.read = read;
  }

  public String getId() {
    return id;
  }

  public String getType() {
    return type;
  }

  public String getTitle() {
    return title;
  }

  public String getMessage() {
    return message;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public boolean isRead() {
    return read;
  }
}
