package com.fittrack.repository;

import com.fittrack.model.OtpCode;
import com.fittrack.model.OtpType;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
  Optional<OtpCode> findByIdAndType(Long id, OtpType type);
  void deleteByExpiresAtBefore(LocalDateTime time);
}
