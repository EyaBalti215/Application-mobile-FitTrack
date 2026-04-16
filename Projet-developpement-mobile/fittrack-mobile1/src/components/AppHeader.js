import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { useSettings } from '../context/SettingsContext';
import { appHeaderStyles as styles } from '../styles/appHeaderStyles';
import PressableScale from './PressableScale';

const tabs = [
  { key: 'Dashboard', labelKey: 'tabs.dashboard', icon: 'analytics-outline' },
  { key: 'Activities', labelKey: 'tabs.activities', icon: 'walk-outline' },
  { key: 'Goals', labelKey: 'tabs.goals', icon: 'radio-button-on-outline' },
  { key: 'Progress', labelKey: 'tabs.progress', icon: 'trending-up-outline' },
  { key: 'Heatmap', labelKey: 'tabs.heatmap', icon: 'calendar-outline' },
];

export default function AppHeader({
  activeTab,
  onNavigate,
  onAddActivity,
  onSettings,
  onNotifications,
  notificationCount = 0,
}) {
  const { t, colors } = useSettings();

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <LinearGradient colors={['#9A5CFF', '#FF6A3D']} style={styles.brandBadge}>
            <Ionicons name="pulse" size={16} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>{t('app.name')}</Text>
            <Text style={[styles.brandSubtitle, { color: colors.mutedText }]}>{t('app.welcomeBack')}</Text>
          </View>
        </View>

        <View style={styles.actionsWrap}>
          <PressableScale onPress={onAddActivity} activeScale={0.94}>
            <View style={styles.addButton}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{t('header.addActivity')}</Text>
            </View>
          </PressableScale>

          <PressableScale onPress={onSettings} activeScale={0.92}>
            <View style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={18} color="#4B5563" />
            </View>
          </PressableScale>

          <PressableScale onPress={onNotifications} activeScale={0.92}>
            <View style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={18} color="#4B5563" />
              {notificationCount > 0 ? <View style={styles.notificationDot} /> : null}
            </View>
          </PressableScale>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <PressableScale
              key={tab.key}
              style={styles.tabButtonWrap}
              onPress={() => onNavigate(tab.key)}
              activeScale={0.96}
            >
              {active ? (
                <LinearGradient colors={['#7A30FF', '#FF5A3D']} style={styles.activeTabButton}>
                  <Ionicons name={tab.icon} size={14} color="#FFFFFF" />
                  <Text style={styles.activeTabText}>{t(tab.labelKey)}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.tabButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name={tab.icon} size={14} color="#6B7280" />
                  <Text style={[styles.tabText, { color: colors.mutedText }]}>{t(tab.labelKey)}</Text>
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}