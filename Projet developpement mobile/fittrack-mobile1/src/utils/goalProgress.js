function toDate(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function computeGoalCurrent(goal, activities) {
  const start = toDate(goal.startDate);
  const end = toDate(goal.endDate);

  const filtered = activities.filter((activity) => {
    const activityDate = toDate(activity.date);
    if (!activityDate) {
      return false;
    }
    if (start && activityDate < startOfDay(start)) {
      return false;
    }
    if (end && activityDate > endOfDay(end)) {
      return false;
    }
    if (goal.activityType && activity.type !== goal.activityType) {
      return false;
    }
    return true;
  });

  if (goal.type === 'DISTANCE_KM') {
    return filtered.reduce((sum, item) => sum + Number(item.distanceKm || 0), 0);
  }
  if (goal.type === 'CALORIES') {
    return filtered.reduce((sum, item) => sum + Number(item.calories || 0), 0);
  }
  if (goal.type === 'ACTIVITIES_COUNT') {
    return filtered.length;
  }
  return 0;
}

export function computeGoalStatus(goal, currentValue, now = new Date()) {
  const target = Number(goal.targetValue || 0);
  if (target > 0 && currentValue >= target) {
    return 'SUCCESS';
  }

  const end = toDate(goal.endDate);
  if (end && now > endOfDay(end)) {
    return 'FAILED';
  }

  return 'IN_PROGRESS';
}

export function computeGoalProgressPercent(goal, currentValue) {
  const target = Number(goal.targetValue || 0);
  if (!target || target <= 0) {
    return 0;
  }
  return Math.max(0, Math.round((currentValue / target) * 100));
}
