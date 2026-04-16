package com.fittrack.repository;

import com.fittrack.model.Activity;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
  List<Activity> findByUserIdOrderByDateDesc(Long userId);
  List<Activity> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
}
