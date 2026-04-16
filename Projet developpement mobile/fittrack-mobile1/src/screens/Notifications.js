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
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { notificationsStyles as styles } from '../styles/notificationsStyles';

function iconUi(type) {
  if (type === 'SUCCESS') {
    return { icon: 'checkmark-done-outline', color: '#15803D', bg: '#DCFCE7' };
  }
  if (type === 'REMINDER') {
    return { icon: 'alarm-outline', color: '#A16207', bg: '#FEF3C7' };
  }
  return { icon: 'information-circle-outline', color: '#1D4ED8', bg: '#DBEAFE' };
}

function formatDateTime(value, locale, fallbackLabel) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallbackLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function Notifications() {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const { t, language } = useSettings();
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Accueil');
  };

  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const authHeaders = useMemo(() => {
    if (!token) {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const loadNotifications = async () => {
    if (!token) {
      setError(t('common.sessionMissing'));
      return;
    }

    setError(null);
    const data = await apiRequest('/api/notifications', { headers: authHeaders });
    setNotifications(Array.isArray(data) ? data : []);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await loadNotifications();
    } catch (loadErr) {
      setError(loadErr.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [token]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#2563EB" />}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('notifications.title')}</Text>
          <TouchableOpacity style={styles.dashboardButton} activeOpacity={0.85} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.dashboardButtonText}>{t('notifications.dashboard')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>{t('notifications.headerTitle')}</Text>
          <Text style={styles.headerText}>{t('notifications.headerText')}</Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={16} color="#B45309" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.listWrap}>
          {notifications.length ? (
            notifications.map((item) => {
              const ui = iconUi(item.type);
              return (
                <View key={item.id} style={styles.notificationCard}>
                  <View style={[styles.iconWrap, { backgroundColor: ui.bg }]}>
                    <Ionicons name={ui.icon} size={18} color={ui.color} />
                  </View>
                  <View style={styles.notificationMain}>
                    <View style={styles.itemTop}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemDate}>{formatDateTime(item.createdAt, locale, t('notifications.justNow'))}</Text>
                    </View>
                    <Text style={styles.itemText}>{item.message}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="notifications-off-outline" size={20} color="#94A3B8" />
              <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
