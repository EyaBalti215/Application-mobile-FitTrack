package com.fittrack.controller;

import com.fittrack.dto.user.ProfileResponse;
import com.fittrack.dto.user.UpdateProfileRequest;
import com.fittrack.security.UserPrincipal;
import com.fittrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
  private final UserService userService;

  public ProfileController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  public ProfileResponse getProfile(@AuthenticationPrincipal UserPrincipal principal) {
    return userService.getProfile(principal.getId());
  }

  @PutMapping
  public ProfileResponse updateProfile(
      @AuthenticationPrincipal UserPrincipal principal,
      @Valid @RequestBody UpdateProfileRequest request) {
    return userService.updateProfile(principal.getId(), request);
  }
}
