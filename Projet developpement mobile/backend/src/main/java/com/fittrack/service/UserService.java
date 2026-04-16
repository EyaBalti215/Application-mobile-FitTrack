package com.fittrack.service;

import com.fittrack.dto.user.ProfileResponse;
import com.fittrack.dto.user.UpdateProfileRequest;
import com.fittrack.exception.ApiException;
import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class UserService {
  private static final int MAX_AVATAR_LENGTH = 2_000_000;

  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public User getUser(Long userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
  }

  public ProfileResponse getProfile(Long userId) {
    User user = getUser(userId);
    return new ProfileResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getWeightKg(),
        user.getHeightCm(),
        user.getAge(),
        user.getAvatarUrl());
  }

  public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
    User user = getUser(userId);
    user.setName(request.getName());
    user.setWeightKg(request.getWeightKg());
    user.setHeightCm(request.getHeightCm());
    user.setAge(request.getAge());
    user.setAvatarUrl(normalizeAvatar(request.getAvatarUrl()));
    userRepository.save(user);
    return getProfile(userId);
  }

  private String normalizeAvatar(String avatarUrl) {
    if (avatarUrl == null) {
      return null;
    }

    String cleaned = avatarUrl.trim();
    if (cleaned.isEmpty()) {
      return null;
    }

    if (cleaned.length() > MAX_AVATAR_LENGTH) {
      throw new ApiException("Avatar image is too large", HttpStatus.BAD_REQUEST);
    }

    return cleaned;
  }
}
