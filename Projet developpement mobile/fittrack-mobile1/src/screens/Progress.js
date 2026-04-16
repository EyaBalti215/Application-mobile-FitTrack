import { RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
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
import { progressStyles as styles } from '../styles/progressStyles';

function goalTypeLabel(goal, t) {
  const typeLabel = {
    DISTANCE_KM: t('goals.type.distance'),
    CALORIES: t('goals.type.calories'),
    ACTIVITIES_COUNT: t('goals.type.activities'),
  }[goal.type] || goal.type;

  return `${typeLabel}${goal.activityType ? ` (${goal.activityType})` : ''}`;
}

function goalStatusLabel(status, t) {
  if (status === 'SUCCESS') {
    return t('goals.status.success');
  }
  if (status === 'FAILED') {
    return t('goals.status.failed');
  }
  return t('goals.status.inProgress');
}

export default function Progress() {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const { colors, t } = useSettings();
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const authHeaders = useMemo(() => {
    if (!token) {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const [goalsData, activitiesData] = await Promise.all([
        apiRequest('/api/goals', { headers: authHeaders }),
        apiRequest('/api/activities', { headers: authHeaders }),
      ]);
      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setError(null);
    } catch (loadErr) {
      setError(loadErr.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [token]);

  const evaluated = useMemo(() => {
    return goals.map((goal) => {
      const current = computeGoalCurrent(goal, activities);
      const status = computeGoalStatus(goal, current);
      const progress = computeGoalProgressPercent(goal, current);
      return { ...goal, current, status, progress };
    });
  }, [activities, goals]);

  const report = useMemo(() => {
    const success = evaluated.filter((goal) => goal.status === 'SUCCESS').length;
    const failed = evaluated.filter((goal) => goal.status === 'FAILED').length;
    const inProgress = evaluated.filter((goal) => goal.status === 'IN_PROGRESS').length;
    const completionRate = evaluated.length ? Math.round((success / evaluated.length) * 100) : 0;
    return { success, failed, inProgress, completionRate };
  }, [evaluated]);

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
          activeTab="Progress"
          onNavigate={(target) => navigation.navigate(target)}
          onAddActivity={() => navigation.navigate('Activities', { openForm: true })}
          onSettings={() => navigation.navigate('Settings')}
          onNotifications={() => navigation.navigate('Notifications')}
          notificationCount={1}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.title}>{t('progress.title')}</Text>
          <Text style={styles.description}>{t('progress.description')}</Text>
          <Text style={styles.rateValue}>{report.completionRate}%</Text>
          <Text style={styles.rateLabel}>{t('progress.rateLabel')}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.statValue}>{report.success}</Text>
            <Text style={styles.statLabel}>{t('goals.status.success')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statValue}>{report.inProgress}</Text>
            <Text style={styles.statLabel}>{t('goals.status.inProgress')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.statValue}>{report.failed}</Text>
            <Text style={styles.statLabel}>{t('goals.status.failed')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('progress.sectionTitle')}</Text>
          {error ? <Text style={styles.errorText}>{t('common.errorPrefix')}: {error}</Text> : null}

          {!evaluated.length ? (
            <Text style={styles.emptyText}>{t('progress.empty')}</Text>
          ) : (
            evaluated.map((goal) => (
              <View key={goal.id} style={styles.itemRow}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemTitle}>{goalTypeLabel(goal, t)}</Text>
                  <Text style={styles.itemMeta}>
                    {goal.current.toFixed(1)} / {Number(goal.targetValue || 0).toFixed(1)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.itemStatus,
                    goal.status === 'SUCCESS' ? styles.ok : null,
                    goal.status === 'FAILED' ? styles.ko : null,
                  ]}
                >
                  {goalStatusLabel(goal.status, t)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}