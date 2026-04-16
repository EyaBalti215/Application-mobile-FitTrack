import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { apiRequest } from '../api/client';
import AppHeader from '../components/AppHeader';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { heatmapStyles as styles } from '../styles/heatmapStyles';

function toDate(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toLocalDateKey(value) {
  const date = toDate(value);
  if (!date) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseKey(key) {
  if (!key) {
    return null;
  }
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function startOfMonth(value) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfMonth(value) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0);
}

function addMonths(value, delta) {
  return new Date(value.getFullYear(), value.getMonth() + delta, 1);
}

function cellTone(count, selected) {
  if (selected) {
    return '#7A30FF';
  }
  if (!count) {
    return '#FFFFFF';
  }
  if (count === 1) {
    return '#DBEAFE';
  }
  if (count === 2) {
    return '#93C5FD';
  }
  return '#2563EB';
}

function monthSummary(activities, monthCursor) {
  const start = startOfMonth(monthCursor);
  const end = endOfMonth(monthCursor);

  return activities.reduce(
    (acc, item) => {
      const parsed = toDate(item.date);
      if (!parsed || parsed < start || parsed > end) {
        return acc;
      }
      acc.count += 1;
      acc.distance += Number(item.distanceKm || 0);
      acc.calories += Number(item.calories || 0);
      acc.duration += Number(item.durationMinutes || 0);
      return acc;
    },
    { count: 0, distance: 0, calories: 0, duration: 0 }
  );
}

function formatDuration(totalMinutes) {
  const safe = Math.max(0, Math.round(Number(totalMinutes || 0)));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${hours}h ${minutes}m`;
}

export default function Heatmap() {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const { colors, t, language } = useSettings();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => toLocalDateKey(new Date()));

  const authHeaders = useMemo(() => {
    if (!token) {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const locale = useMemo(() => (language === 'fr' ? 'fr-FR' : 'en-US'), [language]);

  const weekdays = useMemo(
    () => [
      t('heatmap.weekday.mon'),
      t('heatmap.weekday.tue'),
      t('heatmap.weekday.wed'),
      t('heatmap.weekday.thu'),
      t('heatmap.weekday.fri'),
      t('heatmap.weekday.sat'),
      t('heatmap.weekday.sun'),
    ],
    [t]
  );

  const activityMap = useMemo(() => {
    const map = new Map();
    activities.forEach((item) => {
      const key = toLocalDateKey(item.date);
      if (!key) {
        return;
      }
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });

    map.forEach((items) => {
      items.sort((a, b) => {
        const left = toDate(a.date)?.getTime() || 0;
        const right = toDate(b.date)?.getTime() || 0;
        return right - left;
      });
    });

    return map;
  }, [activities]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(monthCursor);
  }, [monthCursor, locale]);

  const monthCells = useMemo(() => {
    const first = startOfMonth(monthCursor);
    const last = endOfMonth(monthCursor);

    const firstWeekday = (first.getDay() + 6) % 7;
    const cells = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ key: `empty-${i}`, empty: true });
    }

    for (let day = 1; day <= last.getDate(); day += 1) {
      const date = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day);
      const key = toLocalDateKey(date);
      cells.push({
        key,
        empty: false,
        day,
        count: (activityMap.get(key) || []).length,
      });
    }

    return cells;
  }, [activityMap, monthCursor]);

  const selectedDayActivities = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }
    return activityMap.get(selectedDateKey) || [];
  }, [activityMap, selectedDateKey]);

  const selectedDateDisplay = useMemo(() => {
    const parsed = parseKey(selectedDateKey);
    if (!parsed) {
      return selectedDateKey;
    }
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  }, [selectedDateKey, locale]);

  const summary = useMemo(() => monthSummary(activities, monthCursor), [activities, monthCursor]);

  const loadData = async () => {
    if (!token) {
      setError(t('common.sessionMissing'));
      return;
    }

    setError(null);
    const data = await apiRequest('/api/activities', { headers: authHeaders });
    setActivities(Array.isArray(data) ? data : []);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [token]);

  useEffect(() => {
    const first = startOfMonth(monthCursor);
    const last = endOfMonth(monthCursor);
    const selectedDate = parseKey(selectedDateKey);

    if (!selectedDate || selectedDate < first || selectedDate > last) {
      setSelectedDateKey(toLocalDateKey(first));
    }
  }, [monthCursor, selectedDateKey]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#7A30FF" />}
      >
        <AppHeader
          activeTab="Heatmap"
          onNavigate={(target) => navigation.navigate(target)}
          onAddActivity={() => navigation.navigate('Activities', { openForm: true })}
          onSettings={() => navigation.navigate('Settings')}
          onNotifications={() => navigation.navigate('Notifications')}
          notificationCount={1}
        />

        <View style={styles.card}>
          <Text style={styles.title}>{t('heatmap.title')}</Text>
          <Text style={styles.description}>{t('heatmap.description')}</Text>

          <View style={styles.monthHeaderRow}>
            <TouchableOpacity
              style={styles.monthButton}
              activeOpacity={0.85}
              onPress={() => setMonthCursor((prev) => addMonths(prev, -1))}
            >
              <Ionicons name="chevron-back" size={18} color="#374151" />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>{monthLabel}</Text>

            <TouchableOpacity
              style={styles.monthButton}
              activeOpacity={0.85}
              onPress={() => setMonthCursor((prev) => addMonths(prev, 1))}
            >
              <Ionicons name="chevron-forward" size={18} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {weekdays.map((item) => (
              <View key={item} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {monthCells.map((cell) => {
              if (cell.empty) {
                return (
                  <View key={cell.key} style={styles.cellWrap}>
                    <View style={styles.emptyCell} />
                  </View>
                );
              }

              const selected = selectedDateKey === cell.key;
              return (
                <View key={cell.key} style={styles.cellWrap}>
                  <TouchableOpacity
                    style={[
                      styles.dayCell,
                      {
                        backgroundColor: cellTone(cell.count, selected),
                      },
                      selected ? styles.selectedDayCell : null,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedDateKey(cell.key)}
                  >
                    <Text style={[styles.dayText, selected ? styles.selectedDayText : null]}>{cell.day}</Text>
                    {cell.count ? (
                      <View style={styles.countBadge}>
                        <Text style={styles.countText}>{cell.count}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1' }]} />
              <Text style={styles.legendText}>{t('heatmap.legend.none')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#93C5FD' }]} />
              <Text style={styles.legendText}>{t('heatmap.legend.low')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.legendText}>{t('heatmap.legend.high')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.selectedDateTitle}>
            {t('heatmap.activitiesOnDate').replace('{date}', selectedDateDisplay || selectedDateKey)}
          </Text>

          {!selectedDayActivities.length ? (
            <Text style={styles.emptyText}>{t('heatmap.emptySelectedDate')}</Text>
          ) : (
            selectedDayActivities.map((item) => (
              <View key={`${item.id}-${item.date}`} style={styles.activityItem}>
                <Text style={styles.activityTitle}>{item.type}</Text>
                <Text style={styles.activityMeta}>{`${Math.round(item.durationMinutes || 0)} min - ${Math.round(item.calories || 0)} kcal`}</Text>
                <Text style={styles.activityMeta}>{`${Number(item.distanceKm || 0).toFixed(1)} km`}</Text>
                {item.notes ? <Text style={styles.activityMeta}>{item.notes}</Text> : null}
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.selectedDateTitle}>{t('heatmap.monthSummary')}</Text>
          <Text style={styles.description}>{`${t('heatmap.summary.activities')}: ${summary.count}`}</Text>
          <Text style={styles.description}>{`${t('heatmap.summary.distance')}: ${summary.distance.toFixed(1)} km`}</Text>
          <Text style={styles.description}>{`${t('heatmap.summary.calories')}: ${Math.round(summary.calories)} kcal`}</Text>
          <Text style={styles.description}>{`${t('heatmap.summary.duration')}: ${formatDuration(summary.duration)}`}</Text>
        </View>

        {error ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
