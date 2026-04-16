import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { signUpStyles as styles } from '../styles/signUpStyles';
import { apiRequest } from '../api/client';
import { useSettings } from '../context/SettingsContext';

export default function SignUp() {
  const navigation = useNavigation();
  const { t } = useSettings();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Accueil');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(t('auth.signUp.missingInfoTitle'), t('auth.signUp.missingRequired'));
      return;
    }
    if (!weightKg || !heightCm || !age) {
      Alert.alert(t('auth.signUp.missingInfoTitle'), t('auth.signUp.missingBodyMetrics'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('auth.signUp.passwordMismatchTitle'), t('auth.signUp.passwordMismatchBody'));
      return;
    }

    const parsedWeightKg = Number(weightKg);
    const parsedHeightCm = Number(heightCm);
    const parsedAge = Number(age);

    if (
      Number.isNaN(parsedWeightKg) ||
      Number.isNaN(parsedHeightCm) ||
      Number.isNaN(parsedAge) ||
      parsedWeightKg <= 0 ||
      parsedHeightCm <= 0 ||
      parsedAge <= 0
    ) {
      Alert.alert(t('auth.signUp.invalidValuesTitle'), t('auth.signUp.invalidValuesBody'));
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          weightKg: parsedWeightKg,
          heightCm: parsedHeightCm,
          age: Math.trunc(parsedAge),
        }),
      });
      Alert.alert(t('auth.signUp.successTitle'), t('auth.signUp.successBody'));
      navigation.navigate('SignIn');
    } catch (error) {
      Alert.alert(t('auth.signUp.failedTitle'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={18} color="#1F2937" />
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={['#7A30FF', '#FF6A3D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.logoRow}>
            <LinearGradient
              colors={['#9A5CFF', '#FF7A55']}
              style={styles.logoBadge}
            >
              <Ionicons name="pulse" size={18} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.logoTitle}>{t('app.name')}</Text>
              <Text style={styles.logoSubtitle}>{t('auth.signUp.logoSubtitle')}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{t('auth.signUp.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('auth.signUp.heroSubtitle')}</Text>

          <View style={styles.featureList}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.pinkIcon]}>
                <Ionicons name="flame" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{t('auth.signUp.feature1Title')}</Text>
                <Text style={styles.featureBody}>{t('auth.signUp.feature1Body')}</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.orangeIcon]}>
                <Ionicons name="analytics" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{t('auth.signUp.feature2Title')}</Text>
                <Text style={styles.featureBody}>{t('auth.signUp.feature2Body')}</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, styles.redIcon]}>
                <Ionicons name="flash" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{t('auth.signUp.feature3Title')}</Text>
                <Text style={styles.featureBody}>{t('auth.signUp.feature3Body')}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#7A30FF', '#FF6A3D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressFill}
            />
          </View>

          <Text style={styles.formTitle}>{t('auth.signUp.formTitle')}</Text>
          <Text style={styles.formSubtitle}>{t('auth.signUp.formSubtitle')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.signUp.fullName')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#97A1B3" />
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#9AA5B5"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('common.email')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#97A1B3" />
              <TextInput
                placeholder="email@example.com"
                placeholderTextColor="#9AA5B5"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('common.password')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#97A1B3" />
              <TextInput
                placeholder="********"
                placeholderTextColor="#9AA5B5"
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsPasswordVisible((prev) => !prev)}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={16}
                  color="#9AA5B5"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.signUp.confirmPassword')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#97A1B3" />
              <TextInput
                placeholder="********"
                placeholderTextColor="#9AA5B5"
                secureTextEntry={!isConfirmVisible}
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsConfirmVisible((prev) => !prev)}
              >
                <Ionicons
                  name={isConfirmVisible ? 'eye-off' : 'eye'}
                  size={16}
                  color="#9AA5B5"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.signUp.weight')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="barbell-outline" size={18} color="#97A1B3" />
              <TextInput
                placeholder="60"
                placeholderTextColor="#9AA5B5"
                keyboardType="numeric"
                style={styles.input}
                value={weightKg}
                onChangeText={setWeightKg}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.signUp.height')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="resize-outline" size={18} color="#97A1B3" />
              <TextInput
                placeholder="170"
                placeholderTextColor="#9AA5B5"
                keyboardType="numeric"
                style={styles.input}
                value={heightCm}
                onChangeText={setHeightCm}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.signUp.age')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="calendar-outline" size={18} color="#97A1B3" />
              <TextInput
                placeholder="22"
                placeholderTextColor="#9AA5B5"
                keyboardType="numeric"
                style={styles.input}
                value={age}
                onChangeText={setAge}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.submitButtonWrap}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#7A30FF', '#FF6A3D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>
                {isLoading ? t('auth.signUp.creating') : t('auth.signUp.continue')}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.signInText}>
            {t('auth.signUp.hasAccount')}{' '}
            <Text style={styles.signInLink} onPress={handleSignIn}>
              {t('auth.signUp.signIn')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
