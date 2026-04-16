import { Alert, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest } from '../api/client';
import AppHeader from '../components/AppHeader';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  computeGoalCurrent,
  computeGoalProgressPercent,
  computeGoalStatus,
} from '../utils/goalProgress';
import { goalsStyles as styles } from '../styles/goalsStyles';
import PressableScale from '../components/PressableScale';

function goalLabel(goal, t) {
  const typeLabel = {
    DISTANCE_KM: t('goals.type.distance'),
    CALORIES: t('goals.type.calories'),
    ACTIVITIES_COUNT: t('goals.type.activities'),
  }[goal.type] || goal.type;

  const scope = goal.activityType ? ` (${goal.activityType})` : '';
  return `${typeLabel}${scope}`;
}

function statusUi(status, t) {
  if (status === 'SUCCESS') {
    return { text: t('goals.status.success'), color: '#166534', bg: '#DCFCE7', ring: '#22C55E' };
  }
  if (status === 'FAILED') {
    return { text: t('goals.status.failed'), color: '#991B1B', bg: '#FEE2E2', ring: '#EF4444' };
  }
  return { text: t('goals.status.inProgress'), color: '#92400E', bg: '#FEF3C7', ring: '#F59E0B' };
}

function CircleProgress({ progress, color }) {
  const normalized = Math.min(Math.max(progress, 0), 100);
  return (
    <View style={styles.ringOuter}>
      <View style={[styles.ringValueArc, { borderColor: color, transform: [{ rotate: `${(normalized / 100) * 360}deg` }] }]} />
      <View style={styles.ringInner}>
        <Text style={styles.ringText}>{normalized}%</Text>
      </View>
    </View>
  );
}

export default function Goals() {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const { colors, t } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);

  const authHeaders = useMemo(() => {
    if (!token) {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const loadData = async () => {
    if (!token) {
      setError(t('common.sessionMissing'));
      return;
    }
    setError(null);
    const [goalsData, activitiesData] = await Promise.all([
      apiRequest('/api/goals', { headers: authHeaders }),
      apiRequest('/api/activities', { headers: authHeaders }),
    ]);
    setGoals(Array.isArray(goalsData) ? goalsData : []);
    setActivities(Array.isArray(activitiesData) ? activitiesData : []);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } catch (loadErr) {
      setError(loadErr.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [token]);

  const enrichedGoals = useMemo(() => {
    return goals.map((goal) => {
      const current = computeGoalCurrent(goal, activities);
      const status = computeGoalStatus(goal, current);
      const progress = computeGoalProgressPercent(goal, current);
      return { ...goal, current, status, progress };
    });
  }, [activities, goals]);

  const summary = useMemo(() => {
    return enrichedGoals.reduce(
      (acc, goal) => {
        if (goal.status === 'SUCCESS') {
          acc.success += 1;
        } else if (goal.status === 'FAILED') {
          acc.failed += 1;
        } else {
          acc.inProgress += 1;
        }
        return acc;
      },
      { success: 0, failed: 0, inProgress: 0 }
    );
  }, [enrichedGoals]);

  const deleteGoal = async (id) => {
    try {
      await apiRequest(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      await refresh();
    } catch (deleteErr) {
      Alert.alert(t('goals.deleteFailedTitle'), deleteErr.message);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#7A30FF" />
        }
      >
        <AppHeader
          activeTab="Goals"
          onNavigate={(target) => navigation.navigate(target)}
          onAddActivity={() => navigation.navigate('Activities', { openForm: true })}
          onSettings={() => navigation.navigate('Settings')}
          onNotifications={() => navigation.navigate('Notifications')}
          notificationCount={1}
        />

        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.summaryValue}>{summary.success}</Text>
            <Text style={styles.summaryLabel}>{t('goals.status.success')}</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.summaryValue}>{summary.inProgress}</Text>
            <Text style={styles.summaryLabel}>{t('goals.status.inProgress')}</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.summaryValue}>{summary.failed}</Text>
            <Text style={styles.summaryLabel}>{t('goals.status.failed')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('goals.title')}</Text>
          <Text style={styles.description}>{t('goals.description')}</Text>
          {error ? <Text style={styles.errorText}>{t('common.errorPrefix')}: {error}</Text> : null}

          {!enrichedGoals.length ? (
            <Text style={styles.emptyText}>{t('goals.empty')}</Text>
          ) : (
            enrichedGoals.map((goal) => {
              const ui = statusUi(goal.status, t);
              const translatedLabel = goalLabel(goal, t);
              return (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalTopRow}>
                    <View style={styles.goalMainInfo}>
                      <View style={styles.goalHeader}>
                        <Text style={styles.goalTitle}>{translatedLabel}</Text>
                        <View style={[styles.statusPill, { backgroundColor: ui.bg }]}>
                          <Text style={[styles.statusText, { color: ui.color }]}>{ui.text}</Text>
                        </View>
                      </View>

                      <Text style={styles.goalMeta}>
                        {goal.current.toFixed(1)} / {Number(goal.targetValue || 0).toFixed(1)}
                      </Text>
                      <Text style={styles.goalMeta}>
                        {goal.startDate} {t('common.to')} {goal.endDate || t('common.na')}
                      </Text>
                    </View>
                    <CircleProgress progress={goal.progress} color={ui.ring} />
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(goal.progress, 100)}%`, backgroundColor: ui.ring },
                      ]}
                    />
                  </View>

                  <View style={styles.goalFooter}>
                    <Text style={styles.progressText}>{goal.progress}%</Text>
                    <PressableScale onPress={() => deleteGoal(goal.id)} activeScale={0.9}>
                      <View>
                        <Text style={styles.deleteText}>{t('goals.deleteAction')}</Text>
                      </View>
                    </PressableScale>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}