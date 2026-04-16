import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

import { apiRequest } from '../api/client';
import AppHeader from '../components/AppHeader';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { dashboardStyles as styles } from '../styles/dashboardStyles';

const FALLBACK_PROFILE = {
  name: '',
  email: '',
};

const FALLBACK_STATS = {
  totalDistanceKm: 39.5,
  totalCalories: 1840,
  totalDurationMinutes: 225,
  weeklyCalories: [180, 220, 260, 190, 300, 350, 340],
};

function formatDayLabel(date, locale) {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
}

function toDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
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

function getLastSevenDays() {
  const end = startOfDay(new Date());
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start, end };
}

function buildWeeklySeries(activities, locale) {
  const { start } = getLastSevenDays();
  const base = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      day: formatDayLabel(date, locale),
      distance: 0,
      calories: 0,
    };
  });

  activities.forEach((activity) => {
    const date = toDate(activity.date);
    if (!date) {
      return;
    }
    const dayIndex = Math.floor((startOfDay(date).getTime() - start.getTime()) / 86400000);
    if (dayIndex < 0 || dayIndex > 6) {
      return;
    }
    base[dayIndex].distance += Number(activity.distanceKm || 0);
    base[dayIndex].calories += Number(activity.calories || 0);
  });

  return base;
}

function sumMetric(activities, field) {
  return activities.reduce((sum, item) => sum + Number(item[field] || 0), 0);
}

function sumDuration(activities) {
  return activities.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);
}

function growthPercent(current, previous) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function getInitials(name) {
  if (!name) {
    return 'U';
  }
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatDuration(minutes) {
  if (!minutes || Number.isNaN(minutes)) {
    return '0m';
  }
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const remaining = total % 60;
  if (hours > 0) {
    return `${hours}h ${remaining}m`;
  }
  return `${remaining}m`;
}

export default function Dashboard() {
  const navigation = useNavigation();
  const { token, setToken } = useContext(AuthContext);
  const { colors, t, language } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [activities, setActivities] = useState([]);
  const metricScales = useRef(Array.from({ length: 4 }, () => new Animated.Value(1))).current;
  const distanceBarHeights = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;
  const caloriesBarHeights = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;

  const authHeaders = useMemo(() => {
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const locale = useMemo(() => (language === 'fr' ? 'fr-FR' : 'en-US'), [language]);

  const weeklySeries = useMemo(() => buildWeeklySeries(activities, locale), [activities, locale]);

  const dailyAverageLast7Days = useMemo(() => {
    const totalLast7DaysCalories = weeklySeries.reduce((sum, day) => sum + day.calories, 0);
    return Math.round(totalLast7DaysCalories / 7);
  }, [weeklySeries]);

  const distanceBars = useMemo(() => {
    const max = Math.max(...weeklySeries.map((item) => item.distance), 0.1);
    return weeklySeries.map((item, index) => ({
      key: `distance-${index}`,
      day: item.day,
      value: item.distance,
      heightPercent: Math.max(12, Math.round((item.distance / max) * 100)),
    }));
  }, [weeklySeries]);

  const caloriesBars = useMemo(() => {
    const max = Math.max(...weeklySeries.map((item) => item.calories), 1);
    return weeklySeries.map((item, index) => ({
      key: `calories-${index}`,
      day: item.day,
      value: item.calories,
      heightPercent: Math.max(8, Math.round((item.calories / max) * 100)),
    }));
  }, [weeklySeries]);

  const growth = useMemo(() => {
    const today = startOfDay(new Date());
    const currentStart = new Date(today);
    currentStart.setDate(today.getDate() - 6);
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousEnd.getDate() - 6);

    const current = activities.filter((item) => {
      const date = toDate(item.date);
      return date && date >= currentStart && date <= endOfDay(today);
    });

    const previous = activities.filter((item) => {
      const date = toDate(item.date);
      return date && date >= startOfDay(previousStart) && date <= endOfDay(previousEnd);
    });

    return {
      distance: growthPercent(sumMetric(current, 'distanceKm'), sumMetric(previous, 'distanceKm')),
      calories: growthPercent(sumMetric(current, 'calories'), sumMetric(previous, 'calories')),
      duration: growthPercent(sumDuration(current), sumDuration(previous)),
      average: growthPercent(sumMetric(current, 'calories') / 7, sumMetric(previous, 'calories') / 7),
    };
  }, [activities]);

  const bestDayInsight = useMemo(() => {
    if (!weeklySeries.length) {
      return t('dashboard.insightEmpty');
    }
    const best = weeklySeries.reduce((acc, curr) => {
      if (!acc || curr.calories > acc.calories) {
        return curr;
      }
      return acc;
    }, null);

    if (!best || best.calories <= 0) {
      return t('dashboard.insightQuiet');
    }

    return t('dashboard.insightBestTemplate')
      .replace('{day}', best.day)
      .replace('{kcal}', Math.round(best.calories));
  }, [weeklySeries, t]);

  const fetchDashboardData = async () => {
    if (!token) {
      setLoadError(t('common.sessionMissing'));
      return;
    }

    setLoadError(null);
    const [statsData, profileData, activitiesData] = await Promise.all([
      apiRequest('/api/stats', { headers: authHeaders }),
      apiRequest('/api/profile', { headers: authHeaders }),
      apiRequest('/api/activities', { headers: authHeaders }),
    ]);

    setStats((prev) => ({
      ...prev,
      ...statsData,
      weeklyCalories:
        Array.isArray(statsData?.weeklyCalories) && statsData.weeklyCalories.length
          ? statsData.weeklyCalories
          : prev.weeklyCalories,
    }));
    setProfile((prev) => ({
      ...prev,
      ...profileData,
    }));
    setActivities(Array.isArray(activitiesData) ? activitiesData : []);
  };

  const loadDashboard = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (error) {
      setLoadError(error.message);
      setStats(FALLBACK_STATS);
      setProfile(FALLBACK_PROFILE);
      setActivities([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  useEffect(() => {
    const animations = distanceBars.map((bar, index) =>
      Animated.spring(distanceBarHeights[index], {
        toValue: Math.max(16, (bar.heightPercent / 100) * 140),
        useNativeDriver: false,
        friction: 8,
      })
    );
    Animated.stagger(40, animations).start();
  }, [distanceBars, distanceBarHeights]);

  useEffect(() => {
    const animations = caloriesBars.map((bar, index) =>
      Animated.spring(caloriesBarHeights[index], {
        toValue: Math.max(12, (bar.heightPercent / 100) * 140),
        useNativeDriver: false,
        friction: 8,
      })
    );
    Animated.stagger(40, animations).start();
  }, [caloriesBars, caloriesBarHeights]);

  const animateMetricCard = (index, toValue) => {
    Animated.spring(metricScales[index], {
      toValue,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handleSignOut = () => {
    setToken(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  };

  const handleNavigateTab = (target) => {
    navigation.navigate(target);
  };

  const metricCards = [
    {
      key: 'distance',
      icon: 'footsteps-outline',
      accent: '#1B92F1',
      title: t('dashboard.metric.distance'),
      value: `${Number(stats.totalDistanceKm || 0).toFixed(1)} km`,
      growth: `${growth.distance >= 0 ? '+' : ''}${growth.distance}%`,
      growthColor: '#15A34A',
      bg: '#E9F5FF',
    },
    {
      key: 'calories',
      icon: 'flame-outline',
      accent: '#FF5A3C',
      title: t('dashboard.metric.calories'),
      value: `${Math.round(stats.totalCalories || 0)} kcal`,
      growth: `${growth.calories >= 0 ? '+' : ''}${growth.calories}%`,
      growthColor: '#15A34A',
      bg: '#FFF0EA',
    },
    {
      key: 'duration',
      icon: 'timer-outline',
      accent: '#BD4CFF',
      title: t('dashboard.metric.duration'),
      value: formatDuration(stats.totalDurationMinutes),
      growth: `${growth.duration >= 0 ? '+' : ''}${growth.duration}%`,
      growthColor: '#15A34A',
      bg: '#F4EDFF',
    },
    {
      key: 'average',
      icon: 'trending-up-outline',
      accent: '#14B86D',
      title: t('dashboard.metric.average'),
      value: `${dailyAverageLast7Days} kcal`,
      growth: `${growth.average >= 0 ? '+' : ''}${growth.average}%`,
      growthColor: '#15A34A',
      bg: '#EAFBF2',
    },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadDashboard}
            tintColor="#7A30FF"
          />
        }
      >
        <AppHeader
          activeTab="Dashboard"
          onNavigate={handleNavigateTab}
          onAddActivity={() => navigation.navigate('Activities', { openForm: true })}
          onSettings={() => navigation.navigate('Settings')}
          onNotifications={() => navigation.navigate('Notifications')}
          notificationCount={1}
        />

        <View style={styles.profileRow}>
          <TouchableOpacity
            style={styles.profileCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Profile')}
          >
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <LinearGradient colors={['#8B47FF', '#FF6A3D']} style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
              </LinearGradient>
            )}
            <View style={styles.profileTextWrap}>
              <Text style={styles.profileName}>{profile.name || t('dashboard.profileFallbackName')}</Text>
              <Text style={styles.profileEmail}>{profile.email || t('dashboard.profileFallbackEmail')}</Text>
            </View>
            <Ionicons name="create-outline" size={18} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.8}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={18} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#7A30FF', '#FF4D00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <Text style={styles.welcomeTitle}>{t('dashboard.welcomeTitle')}</Text>
          <Text style={styles.welcomeSubtitle}>{t('dashboard.welcomeSubtitle')}</Text>
        </LinearGradient>

        {loadError ? (
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={16} color="#9A3412" />
            <Text style={styles.warningText}>{t('dashboard.warningPrefix')}: {loadError}</Text>
          </View>
        ) : null}

        <View style={styles.insightCard}>
          <View style={styles.insightIconWrap}>
            <Ionicons name="bulb-outline" size={18} color="#7A30FF" />
          </View>
          <View style={styles.insightTextWrap}>
            <Text style={styles.insightTitle}>{t('dashboard.insightTitle')}</Text>
            <Text style={styles.insightText}>{bestDayInsight}</Text>
          </View>
        </View>

        <View style={styles.metricsWrap}>
          {metricCards.map((card, index) => (
            <TouchableOpacity
              key={card.key}
              style={styles.metricCardWrap}
              activeOpacity={0.95}
              onPressIn={() => {
                Vibration.vibrate(8);
                animateMetricCard(index, 0.97);
              }}
              onPressOut={() => animateMetricCard(index, 1)}
            >
              <Animated.View
                style={[
                  styles.metricCard,
                  { backgroundColor: card.bg, transform: [{ scale: metricScales[index] }] },
                ]}
              >
                <View style={styles.metricTop}>
                  <View style={[styles.metricIcon, { backgroundColor: card.accent }]}>
                    <Ionicons name={card.icon} size={16} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.metricGrowth, { color: card.growthColor }]}>
                    {card.growth}
                  </Text>
                </View>
                <Text style={styles.metricTitle}>{card.title}</Text>
                <Text style={styles.metricValue}>{card.value}</Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartsGrid}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('dashboard.chart.distanceTitle')}</Text>
            <Text style={styles.chartSubtitle}>{t('dashboard.chart.distanceSubtitle')}</Text>
            <View style={styles.barsWrap}>
              {distanceBars.map((bar, index) => (
                <View key={bar.key} style={styles.barGroup}>
                  <View style={styles.barTrack}>
                    <Animated.View style={{ width: '100%', height: distanceBarHeights[index] }}>
                      <LinearGradient colors={['#9B5CFF', '#DCCBF3']} style={styles.barFill} />
                    </Animated.View>
                  </View>
                  <Text style={styles.barDay}>{bar.day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('dashboard.chart.caloriesTitle')}</Text>
            <Text style={styles.chartSubtitle}>{t('dashboard.chart.caloriesSubtitle')}</Text>
            <View style={styles.barsWrap}>
              {caloriesBars.map((bar, index) => (
                <View key={bar.key} style={styles.barGroup}>
                  <View style={styles.barTrackLight}>
                    <Animated.View style={{ width: '100%', height: caloriesBarHeights[index] }}>
                      <LinearGradient colors={['#FB923C', '#FF5A3C']} style={styles.barFill} />
                    </Animated.View>
                  </View>
                  <Text style={styles.barDay}>{bar.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <View>
              <Text style={styles.chartTitle}>{t('dashboard.recent.title')}</Text>
              <Text style={styles.chartSubtitle}>{t('dashboard.recent.subtitle')}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Activities')} activeOpacity={0.8}>
              <Text style={styles.viewAllText}>{t('dashboard.recent.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          {activities.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.recentItem}>
              <View style={styles.recentBadge}>
                <Ionicons name="fitness-outline" size={15} color="#FFFFFF" />
              </View>
              <View style={styles.recentMain}>
                <Text style={styles.recentTitle}>{item.type}</Text>
                <Text style={styles.recentMeta}>
                  {item.date}
                  {item.notes ? ` • ${item.notes}` : ''}
                </Text>
              </View>
              <View style={styles.recentStats}>
                <Text style={styles.recentStatText}>{Number(item.distanceKm || 0).toFixed(1)} km</Text>
                <Text style={styles.recentStatText}>{Math.round(item.durationMinutes || 0)} min</Text>
                <Text style={styles.recentStatCalories}>{Math.round(item.calories || 0)} kcal</Text>
              </View>
            </View>
          ))}

          {!activities.length ? <Text style={styles.emptyText}>{t('dashboard.recent.empty')}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}