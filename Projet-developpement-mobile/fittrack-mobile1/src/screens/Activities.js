import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { apiRequest } from '../api/client';
import AppHeader from '../components/AppHeader';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { activitiesStyles as styles } from '../styles/activitiesStyles';

const TYPES = ['RUNNING', 'WALKING', 'CYCLING', 'GYM'];
const GOAL_TYPES = ['DISTANCE_KM', 'CALORIES', 'ACTIVITIES_COUNT'];
const GOAL_PERIODS = ['WEEKLY', 'MONTHLY'];

const WEEKLY_DEFAULT_TARGETS = {
  DISTANCE_KM: 50,
  CALORIES: 3000,
  DURATION_MINUTES: 300,
};

function toDate(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayIso() {
  return formatLocalDate(new Date());
}

function parseLocalDate(dateText) {
  const [year, month, day] = dateText.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year
    || parsed.getMonth() !== month - 1
    || parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function startOfWeek(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function endOfWeek(value) {
  const date = startOfWeek(value);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
}

function formatDuration(totalMinutes) {
  const safe = Math.max(0, Math.round(Number(totalMinutes || 0)));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${hours}h ${minutes}m`;
}

function computeGoalEndDate(startDate, period) {
  const start = parseLocalDate(startDate);
  if (!start) {
    return startDate;
  }
  if (period === 'MONTHLY') {
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    return formatLocalDate(end);
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return formatLocalDate(end);
}

function metricPercent(current, target) {
  if (!target || target <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function pickWeeklyTarget(goals, type, fallbackValue) {
  const now = new Date();
  const candidates = goals.filter((goal) => goal.period === 'WEEKLY' && goal.type === type);
  if (!candidates.length) {
    return fallbackValue;
  }

  const activeGoal = candidates.find((goal) => {
    const start = toDate(goal.startDate);
    const end = toDate(goal.endDate);
    if (!start || !end) {
      return false;
    }
    return now >= start && now <= end;
  });

  if (activeGoal) {
    const target = Number(activeGoal.targetValue || 0);
    return target > 0 ? target : fallbackValue;
  }

  const sorted = [...candidates].sort((a, b) => {
    const left = toDate(a.startDate)?.getTime() || 0;
    const right = toDate(b.startDate)?.getTime() || 0;
    return right - left;
  });

  const target = Number(sorted[0]?.targetValue || 0);
  return target > 0 ? target : fallbackValue;
}

function formatMetricValue(metricKey, value) {
  if (metricKey === 'DISTANCE_KM') {
    return Number(value || 0).toFixed(1);
  }
  return String(Math.round(Number(value || 0)));
}

function translateEnum(t, prefix, value) {
  const key = `${prefix}.${value}`;
  const translated = t(key);
  return translated === key ? value : translated;
}

export default function Activities() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useContext(AuthContext);
  const { t, colors } = useSettings();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [type, setType] = useState('RUNNING');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [distanceKm, setDistanceKm] = useState('');
  const [date, setDate] = useState(todayIso());
  const [notes, setNotes] = useState('');
  const [withGoal, setWithGoal] = useState(false);
  const [goalType, setGoalType] = useState('DISTANCE_KM');
  const [goalPeriod, setGoalPeriod] = useState('WEEKLY');
  const [goalTargetValue, setGoalTargetValue] = useState('10');

  const authHeaders = useMemo(() => {
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const resetForm = () => {
    setType('RUNNING');
    setDurationMinutes('30');
    setDistanceKm('');
    setDate(todayIso());
    setNotes('');
    setWithGoal(false);
    setGoalType('DISTANCE_KM');
    setGoalPeriod('WEEKLY');
    setGoalTargetValue('10');
  };

  const fetchData = async () => {
    if (!token) {
      setLoadError(t('common.sessionMissing'));
      return;
    }

    setLoadError(null);

    const [activitiesData, goalsData] = await Promise.all([
      apiRequest('/api/activities', { headers: authHeaders }),
      apiRequest('/api/goals', { headers: authHeaders }).catch(() => []),
    ]);

    setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    setGoals(Array.isArray(goalsData) ? goalsData : []);
  };

  const loadActivities = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [token]);

  useEffect(() => {
    if (route.params?.openForm) {
      setShowForm(true);
      navigation.setParams({ openForm: false });
    }
  }, [navigation, route.params?.openForm]);

  const handleCreateActivity = async () => {
    const durationValue = Number(durationMinutes);
    const distanceValue = distanceKm ? Number(distanceKm) : null;
    const goalTarget = Number(goalTargetValue);

    if (!durationMinutes || Number.isNaN(durationValue) || durationValue <= 0) {
      Alert.alert(t('activities.validation.title'), t('activities.validation.duration'));
      return;
    }

    if (distanceKm && (Number.isNaN(distanceValue) || distanceValue < 0)) {
      Alert.alert(t('activities.validation.title'), t('activities.validation.distance'));
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert(t('activities.validation.title'), t('activities.validation.date'));
      return;
    }

    if (withGoal && (Number.isNaN(goalTarget) || goalTarget <= 0)) {
      Alert.alert(t('activities.validation.title'), t('activities.validation.goalTarget'));
      return;
    }

    setIsSaving(true);
    try {
      const activity = await apiRequest('/api/activities', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          type,
          durationMinutes: durationValue,
          distanceKm: distanceValue,
          date,
          notes,
        }),
      });

      if (withGoal) {
        const endDate = computeGoalEndDate(date, goalPeriod);
        await apiRequest('/api/goals', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            type: goalType,
            activityType: activity.type,
            period: goalPeriod,
            targetValue: goalTarget,
            startDate: date,
            endDate,
          }),
        });
      }

      await fetchData();
      resetForm();
      setShowForm(false);
      Alert.alert(
        t('activities.createSuccessTitle'),
        withGoal ? t('activities.createSuccessWithGoal') : t('activities.createSuccess')
      );
    } catch (error) {
      Alert.alert(t('activities.createFailedTitle'), error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await apiRequest(`/api/activities/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      await fetchData();
    } catch (error) {
      Alert.alert(t('activities.deleteFailedTitle'), error.message);
    }
  };

  const handleNavigateTab = (target) => {
    navigation.navigate(target);
  };

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const left = toDate(a.date)?.getTime() || 0;
      const right = toDate(b.date)?.getTime() || 0;
      return right - left;
    });
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return sortedActivities;
    }

    return sortedActivities.filter((item) => {
      const haystack = [
        item.type,
        item.date,
        item.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [searchQuery, sortedActivities]);

  const totals = useMemo(() => {
    return activities.reduce(
      (acc, item) => {
        acc.total += 1;
        acc.distance += Number(item.distanceKm || 0);
        acc.duration += Number(item.durationMinutes || 0);
        acc.calories += Number(item.calories || 0);
        return acc;
      },
      { total: 0, distance: 0, duration: 0, calories: 0 }
    );
  }, [activities]);

  const weeklyGoals = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const weeklyActivities = activities.filter((item) => {
      const parsed = toDate(item.date);
      return parsed && parsed >= weekStart && parsed <= weekEnd;
    });

    const currentDistance = weeklyActivities.reduce((sum, item) => sum + Number(item.distanceKm || 0), 0);
    const currentCalories = weeklyActivities.reduce((sum, item) => sum + Number(item.calories || 0), 0);
    const currentDuration = weeklyActivities.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);

    const targetDistance = pickWeeklyTarget(goals, 'DISTANCE_KM', WEEKLY_DEFAULT_TARGETS.DISTANCE_KM);
    const targetCalories = pickWeeklyTarget(goals, 'CALORIES', WEEKLY_DEFAULT_TARGETS.CALORIES);
    const targetDuration = WEEKLY_DEFAULT_TARGETS.DURATION_MINUTES;

    return {
      windowLabel: `${formatLocalDate(weekStart)} - ${formatLocalDate(weekEnd)}`,
      metrics: [
        {
          key: 'DISTANCE_KM',
          label: t('activities.goal.metric.distance'),
          unit: 'km',
          color: '#2F6BDE',
          current: currentDistance,
          target: targetDistance,
        },
        {
          key: 'CALORIES',
          label: t('activities.goal.metric.calories'),
          unit: 'kcal',
          color: '#E48900',
          current: currentCalories,
          target: targetCalories,
        },
        {
          key: 'DURATION_MINUTES',
          label: t('activities.goal.metric.duration'),
          unit: 'min',
          color: '#2F6BDE',
          current: currentDuration,
          target: targetDuration,
        },
      ].map((metric) => ({
        ...metric,
        percent: metricPercent(metric.current, metric.target),
      })),
    };
  }, [activities, goals, t]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadActivities}
            tintColor="#7A30FF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          activeTab="Activities"
          onNavigate={handleNavigateTab}
          onAddActivity={() => setShowForm(true)}
          onSettings={() => navigation.navigate('Settings')}
          onNotifications={() => navigation.navigate('Notifications')}
          notificationCount={1}
        />

        <LinearGradient
          colors={['#7B22F4', '#FF4D00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overviewCard}
        >
          <Text style={styles.overviewTitle}>{t('activities.title')}</Text>
          <View style={styles.overviewStatsRow}>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatLabel}>{t('activities.overview.totalActivities')}</Text>
              <Text style={styles.overviewStatValue}>{totals.total}</Text>
            </View>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatLabel}>{t('activities.overview.distance')}</Text>
              <Text style={styles.overviewStatValue}>{`${totals.distance.toFixed(1)} km`}</Text>
            </View>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatLabel}>{t('activities.overview.duration')}</Text>
              <Text style={styles.overviewStatValue}>{formatDuration(totals.duration)}</Text>
            </View>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatLabel}>{t('activities.overview.calories')}</Text>
              <Text style={styles.overviewStatValue}>{`${Math.round(totals.calories)} kcal`}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('activities.search')}
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyTitle}>{t('activities.weeklyGoals')}</Text>
          <Text style={styles.weeklyRange}>{weeklyGoals.windowLabel}</Text>

          <View style={styles.weeklyGoalsRow}>
            {weeklyGoals.metrics.map((metric) => {
              const currentValue = formatMetricValue(metric.key, metric.current);
              const targetValue = formatMetricValue(metric.key, metric.target);
              return (
                <View key={metric.key} style={styles.weeklyGoalItem}>
                  <View style={styles.ringOuter}>
                    <View
                      style={[
                        styles.ringArc,
                        {
                          borderColor: metric.color,
                          transform: [{ rotate: `${(metric.percent / 100) * 360}deg` }],
                        },
                      ]}
                    />
                    <View style={styles.ringInner}>
                      <Text style={styles.ringPercent}>{metric.percent}%</Text>
                      <Text style={styles.ringRatio}>{`${currentValue}/${targetValue}`}</Text>
                    </View>
                  </View>
                  <Text style={styles.weeklyMetricLabel}>{metric.label}</Text>
                  <Text style={styles.weeklyMetricValue}>{`${currentValue} / ${targetValue} ${metric.unit}`}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {showForm ? (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.cardTitle}>{t('activities.form.addTitle')}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} activeOpacity={0.75}>
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('activities.form.type')}</Text>
            <View style={styles.typesRow}>
              {TYPES.map((item) => {
                const selected = item === type;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.typeChip, selected ? styles.typeChipActive : null]}
                    onPress={() => setType(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.typeText, selected ? styles.typeTextActive : null]}>
                      {translateEnum(t, 'activities.type', item)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>{t('activities.form.duration')}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="30"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>{t('activities.form.distance')}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={distanceKm}
              onChangeText={setDistanceKm}
              placeholder="5.0"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>{t('activities.form.date')}</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2026-03-18"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />

            <Text style={styles.label}>{t('activities.form.notes')}</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('activities.form.notesPlaceholder')}
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <View style={styles.goalToggleRow}>
              <Text style={styles.labelInline}>{t('activities.form.goalToggle')}</Text>
              <TouchableOpacity
                onPress={() => setWithGoal((prev) => !prev)}
                style={[styles.toggleButton, withGoal ? styles.toggleButtonActive : null]}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, withGoal ? styles.toggleTextActive : null]}>
                  {withGoal ? t('activities.toggle.on') : t('activities.toggle.off')}
                </Text>
              </TouchableOpacity>
            </View>

            {withGoal ? (
              <>
                <Text style={styles.label}>{t('activities.form.goalMetric')}</Text>
                <View style={styles.typesRow}>
                  {GOAL_TYPES.map((item) => {
                    const selected = item === goalType;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[styles.typeChip, selected ? styles.typeChipActive : null]}
                        onPress={() => setGoalType(item)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.typeText, selected ? styles.typeTextActive : null]}>
                          {translateEnum(t, 'activities.goalType', item)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.label}>{t('activities.form.goalPeriod')}</Text>
                <View style={styles.typesRow}>
                  {GOAL_PERIODS.map((item) => {
                    const selected = item === goalPeriod;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[styles.typeChip, selected ? styles.typeChipActive : null]}
                        onPress={() => setGoalPeriod(item)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.typeText, selected ? styles.typeTextActive : null]}>
                          {translateEnum(t, 'activities.goalPeriod', item)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.label}>{t('activities.form.goalTarget')}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={goalTargetValue}
                  onChangeText={setGoalTargetValue}
                  placeholder="10"
                  placeholderTextColor="#9CA3AF"
                />
              </>
            ) : null}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateActivity}
              disabled={isSaving}
              activeOpacity={0.9}
            >
              <Text style={styles.submitText}>{isSaving ? t('activities.form.saving') : t('activities.form.save')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.listCard}>
          <Text style={styles.cardTitle}>{t('activities.feed')}</Text>
          {loadError ? <Text style={styles.errorText}>{t('common.errorPrefix')}: {loadError}</Text> : null}

          {filteredActivities.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery ? t('activities.empty.search') : t('activities.empty.default')}
            </Text>
          ) : (
            filteredActivities.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityMain}>
                  <Text style={styles.activityType}>{translateEnum(t, 'activities.type', item.type)}</Text>
                  <Text style={styles.activityMeta}>
                    {Math.round(item.durationMinutes)} min
                    {item.distanceKm ? ` - ${Number(item.distanceKm).toFixed(1)} km` : ''}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {item.date} - {Math.round(item.calories || 0)} kcal
                  </Text>
                  {item.notes ? <Text style={styles.activityNotes}>{item.notes}</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteActivity(item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
