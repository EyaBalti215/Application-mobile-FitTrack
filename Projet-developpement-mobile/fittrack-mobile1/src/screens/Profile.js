import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { apiRequest } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { profileStyles as styles } from '../styles/profileStyles';
import PressableScale from '../components/PressableScale';

const EMPTY_PROFILE = {
  name: '',
  email: '',
  weightKg: '',
  heightCm: '',
  age: '',
  avatarUrl: '',
};

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

function toInputNumber(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function toNumber(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function parseDateKey(rawDate) {
  if (!rawDate) {
    return null;
  }
  if (typeof rawDate === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      return rawDate;
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(rawDate)) {
      return rawDate.slice(0, 10);
    }
  }
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function computeCurrentStreak(activities) {
  const keys = new Set(
    (Array.isArray(activities) ? activities : [])
      .map((item) => parseDateKey(item?.date || item?.createdAt || item?.performedAt))
      .filter(Boolean)
  );

  const cursor = new Date();
  let streak = 0;

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!keys.has(key)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function resolveMemberSince(activities, locale, fallbackLabel) {
  const dates = (Array.isArray(activities) ? activities : [])
    .map((item) => parseDateKey(item?.date || item?.createdAt || item?.performedAt))
    .filter(Boolean)
    .sort();

  if (!dates.length) {
    return fallbackLabel;
  }

  const selected = dates[0];
  return new Date(`${selected}T00:00:00`).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

function getBmiValue(weightKg, heightCm) {
  const weight = toNumber(weightKg);
  const height = toNumber(heightCm);
  if (!weight || !height || weight <= 0 || height <= 0) {
    return null;
  }
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

function getBmiStatus(bmi) {
  if (!bmi) {
    return 'unknown';
  }
  if (bmi < 18.5) {
    return 'underweight';
  }
  if (bmi < 25) {
    return 'normal';
  }
  if (bmi < 30) {
    return 'overweight';
  }
  return 'obese';
}

function getDailyCalories(weightKg, heightCm, age) {
  const weight = toNumber(weightKg);
  const height = toNumber(heightCm);
  const ageValue = toNumber(age);
  if (!weight || !height || !ageValue) {
    return null;
  }
  return Math.round(10 * weight + 6.25 * height - 5 * ageValue + 5);
}

function getIdealWeightRange(heightCm) {
  const height = toNumber(heightCm);
  if (!height || height <= 0) {
    return null;
  }
  const heightM = height / 100;
  const min = 18.5 * heightM * heightM;
  const max = 24.9 * heightM * heightM;
  return `${min.toFixed(1)} - ${max.toFixed(1)} kg`;
}

function getFitnessScore({ bmiValue, streakDays, goalsCount }) {
  let score = 45;
  if (bmiValue && bmiValue >= 18.5 && bmiValue < 25) {
    score += 20;
  }
  score += Math.min(streakDays * 2, 20);
  score += Math.min(goalsCount * 3, 15);
  return Math.min(score, 100);
}

function scoreStatus(score) {
  if (score >= 80) {
    return 'excellent';
  }
  if (score >= 65) {
    return 'good';
  }
  if (score >= 50) {
    return 'inProgress';
  }
  return 'needsImprovement';
}

export default function Profile() {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const { t, colors, language } = useSettings();
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [stats, setStats] = useState({
    totalDistanceKm: 0,
    totalActivities: 0,
    goalsCount: 0,
    streakDays: 0,
    memberSince: t('profile.memberSinceUnknown'),
  });
  const [profile, setProfile] = useState(EMPTY_PROFILE);

  const authHeaders = useMemo(() => {
    if (!token) {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const loadProfile = async () => {
    if (!token) {
      setLoadError(t('common.sessionMissing'));
      return;
    }

    setLoadError(null);
    const [profileData, statsData, activitiesData, goalsData] = await Promise.all([
      apiRequest('/api/profile', { headers: authHeaders }),
      apiRequest('/api/stats', { headers: authHeaders }),
      apiRequest('/api/activities', { headers: authHeaders }),
      apiRequest('/api/goals', { headers: authHeaders }),
    ]);

    setProfile({
      name: profileData?.name || '',
      email: profileData?.email || '',
      weightKg: toInputNumber(profileData?.weightKg),
      heightCm: toInputNumber(profileData?.heightCm),
      age: toInputNumber(profileData?.age),
      avatarUrl: profileData?.avatarUrl || '',
    });

    setStats({
      totalDistanceKm: Number(statsData?.totalDistanceKm || 0),
      totalActivities: Array.isArray(activitiesData) ? activitiesData.length : 0,
      goalsCount: Array.isArray(goalsData) ? goalsData.length : 0,
      streakDays: computeCurrentStreak(activitiesData),
      memberSince: resolveMemberSince(activitiesData, locale, t('profile.memberSinceUnknown')),
    });
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await loadProfile();
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [token, language]);

  const handleChooseImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('profile.permissionRequiredTitle'), t('profile.permissionRequiredBody'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      const mimeType = asset.mimeType || 'image/jpeg';
      const avatarPayload = asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri;

      setProfile((prev) => ({
        ...prev,
        avatarUrl: avatarPayload,
      }));
    } catch (error) {
      Alert.alert(t('profile.imageErrorTitle'), error.message || t('profile.imageErrorBody'));
    }
  };

  const handleSave = async () => {
    const weightValue = toNumber(profile.weightKg);
    const heightValue = toNumber(profile.heightCm);
    const ageValue = toNumber(profile.age);

    if (!profile.name.trim()) {
      Alert.alert(t('profile.validationTitle'), t('profile.validation.name'));
      return;
    }

    if (weightValue === null || weightValue <= 0) {
      Alert.alert(t('profile.validationTitle'), t('profile.validation.weight'));
      return;
    }

    if (heightValue === null || heightValue <= 0) {
      Alert.alert(t('profile.validationTitle'), t('profile.validation.height'));
      return;
    }

    if (ageValue === null || ageValue <= 0 || ageValue > 120) {
      Alert.alert(t('profile.validationTitle'), t('profile.validation.age'));
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest('/api/profile', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: profile.name.trim(),
          weightKg: weightValue,
          heightCm: heightValue,
          age: Math.round(ageValue),
          avatarUrl: profile.avatarUrl || null,
        }),
      });
      Alert.alert(t('profile.saveSuccessTitle'), t('profile.saveSuccessBody'));
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      Alert.alert(t('profile.saveFailedTitle'), error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const bmiValue = getBmiValue(profile.weightKg, profile.heightCm);
  const bmiLabel = bmiValue ? bmiValue.toFixed(1) : '--';
  const bmiStatus = t(`profile.bmiStatus.${getBmiStatus(bmiValue)}`);
  const dailyCalories = getDailyCalories(profile.weightKg, profile.heightCm, profile.age);
  const idealWeightRange = getIdealWeightRange(profile.heightCm);
  const fitnessScore = getFitnessScore({
    bmiValue,
    streakDays: stats.streakDays,
    goalsCount: stats.goalsCount,
  });
  const fitnessLabel = t(`profile.fitnessStatus.${scoreStatus(fitnessScore)}`);

  const inputEditable = isEditing;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#2563EB" />}
      >
        <PressableScale onPress={() => navigation.navigate('Dashboard')} activeScale={0.97}>
          <View style={[styles.backToDashboardButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={16} color="#1D4ED8" />
            <Text style={styles.backToDashboardText}>{t('profile.back')}</Text>
          </View>
        </PressableScale>

        <LinearGradient colors={['#8A2BE2', '#FF5A00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.9} onPress={handleChooseImage}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera-outline" size={18} color="#8A2BE2" />
              </View>
            </TouchableOpacity>

            <View style={styles.heroTextWrap}>
              <Text style={styles.heroName}>{profile.name || t('profile.hero.fallbackName')}</Text>
              <Text style={styles.heroEmail}>{profile.email || t('profile.hero.fallbackEmail')}</Text>

              <View style={styles.badgesRow}>
                <View style={styles.heroBadge}>
                  <Text style={styles.badgeLabel}>{t('profile.hero.memberSince')}</Text>
                  <Text style={styles.badgeValue}>{stats.memberSince}</Text>
                </View>
                <View style={styles.heroBadge}>
                  <Text style={styles.badgeLabel}>{t('profile.hero.bmi')}</Text>
                  <Text style={styles.badgeValue}>{bmiLabel}</Text>
                </View>
                <View style={styles.heroBadge}>
                  <Text style={styles.badgeLabel}>{t('profile.hero.status')}</Text>
                  <Text style={styles.badgeValue}>{bmiStatus}</Text>
                </View>
              </View>
            </View>
          </View>

          <PressableScale onPress={() => setIsEditing((prev) => !prev)} activeScale={0.95}>
            <View style={styles.editProfileButton}>
              <Ionicons name={isEditing ? 'close-outline' : 'create-outline'} size={16} color="#8A2BE2" />
              <Text style={styles.editProfileText}>{isEditing ? t('profile.cancel') : t('profile.edit')}</Text>
            </View>
          </PressableScale>
        </LinearGradient>

        {loadError ? (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={16} color="#B45309" />
            <Text style={styles.errorText}>{t('profile.loadErrorPrefix')}: {loadError}</Text>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, styles.blueIconWrap]}>
              <Ionicons name="pulse-outline" size={18} color="#0EA5E9" />
            </View>
            <Text style={styles.statValue}>{stats.totalActivities}</Text>
            <Text style={styles.statLabel}>{t('profile.stats.totalActivities')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, styles.greenIconWrap]}>
              <Ionicons name="radio-button-on-outline" size={18} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.goalsCount}</Text>
            <Text style={styles.statLabel}>{t('profile.stats.goalsAchieved')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, styles.orangeIconWrap]}>
              <Ionicons name="ribbon-outline" size={18} color="#F97316" />
            </View>
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>{t('profile.stats.streakDays')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, styles.purpleIconWrap]}>
              <Ionicons name="trending-up-outline" size={18} color="#C026D3" />
            </View>
            <Text style={styles.statValue}>{Math.round(stats.totalDistanceKm)} km</Text>
            <Text style={styles.statLabel}>{t('profile.stats.totalDistance')}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>

          <Text style={styles.label}>{t('profile.fullName')}</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(value) => setProfile((prev) => ({ ...prev, name: value }))}
              placeholder="John Doe"
              placeholderTextColor="#94A3B8"
              editable={inputEditable}
            />
          </View>

          <Text style={styles.label}>{t('profile.email')}</Text>
          <View style={[styles.inputWithIcon, styles.disabledInputWrap]}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput style={[styles.input, styles.disabledInput]} value={profile.email} editable={false} />
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.thirdInputWrap}>
              <Text style={styles.label}>{t('profile.weight')}</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="barbell-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={profile.weightKg}
                  onChangeText={(value) => setProfile((prev) => ({ ...prev, weightKg: value }))}
                  placeholder="70"
                  placeholderTextColor="#94A3B8"
                  editable={inputEditable}
                />
              </View>
            </View>

            <View style={styles.thirdInputWrap}>
              <Text style={styles.label}>{t('profile.height')}</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="resize-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={profile.heightCm}
                  onChangeText={(value) => setProfile((prev) => ({ ...prev, heightCm: value }))}
                  placeholder="175"
                  placeholderTextColor="#94A3B8"
                  editable={inputEditable}
                />
              </View>
            </View>

            <View style={styles.thirdInputWrap}>
              <Text style={styles.label}>{t('profile.age')}</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={profile.age}
                  onChangeText={(value) => setProfile((prev) => ({ ...prev, age: value }))}
                  placeholder="28"
                  placeholderTextColor="#94A3B8"
                  editable={inputEditable}
                />
              </View>
            </View>
          </View>

          {isEditing ? (
            <PressableScale onPress={handleSave} activeScale={0.96} disabled={isSaving}>
              <View style={[styles.saveButton, isSaving ? styles.saveButtonDisabled : null]}>
                <Text style={styles.saveButtonText}>{isSaving ? t('profile.saving') : t('profile.save')}</Text>
              </View>
            </PressableScale>
          ) : null}
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.sectionTitle}>{t('profile.health.title')}</Text>

          <View style={styles.currentShapeCard}>
            <View style={styles.currentShapeTop}>
              <Text style={styles.currentShapeTitle}>{t('profile.health.currentFitness')}</Text>
              <Text style={styles.currentShapeScore}>{fitnessScore}/100</Text>
            </View>
            <View style={styles.currentShapeTrack}>
              <View style={[styles.currentShapeFill, { width: `${fitnessScore}%` }]} />
            </View>
            <Text style={styles.currentShapeHint}>{fitnessLabel}</Text>
          </View>

          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>{t('profile.health.bmiLabel')}</Text>
            <Text style={[styles.healthValue, styles.healthValueGreen]}>{`${bmiLabel} - ${bmiStatus}`}</Text>
          </View>

          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>{t('profile.health.dailyCalories')}</Text>
            <Text style={styles.healthValue}>{dailyCalories ? `${dailyCalories} kcal` : '--'}</Text>
          </View>

          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>{t('profile.health.idealWeightRange')}</Text>
            <Text style={styles.healthValue}>{idealWeightRange || '--'}</Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>{t('profile.timeline.title')}</Text>

          <View style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineTextWrap}>
              <Text style={styles.timelineTitle}>{t('profile.timeline.consistencyTitle')}</Text>
              <Text style={styles.timelineMeta}>{t('profile.timeline.consistencyMeta').replace('{days}', stats.streakDays)}</Text>
            </View>
          </View>

          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, styles.timelineDotBlue]} />
            <View style={styles.timelineTextWrap}>
              <Text style={styles.timelineTitle}>{t('profile.timeline.goalsTitle')}</Text>
              <Text style={styles.timelineMeta}>{t('profile.timeline.goalsMeta').replace('{goals}', stats.goalsCount)}</Text>
            </View>
          </View>

          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, styles.timelineDotOrange]} />
            <View style={styles.timelineTextWrap}>
              <Text style={styles.timelineTitle}>{t('profile.timeline.distanceTitle')}</Text>
              <Text style={styles.timelineMeta}>{t('profile.timeline.distanceMeta').replace('{distance}', Math.round(stats.totalDistanceKm))}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
