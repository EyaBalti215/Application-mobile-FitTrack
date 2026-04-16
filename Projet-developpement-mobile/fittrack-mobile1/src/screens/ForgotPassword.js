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

import { forgotPasswordStyles as styles } from '../styles/forgotPasswordStyles';
import { apiRequest } from '../api/client';
import { useSettings } from '../context/SettingsContext';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const { t } = useSettings();
  const [email, setEmail] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBackToLogin = () => {
    navigation.navigate('SignIn');
  };

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert(t('auth.forgot.missingInfoTitle'), t('auth.forgot.missingEmail'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setOtpId(data.otpId);
      setOtpCode('');
      const baseMessage = data?.message || t('auth.forgot.requestedBody');
      const otpHint = data?.otpCode ? `\n\nCode OTP: ${data.otpCode}` : '';
      const resetLinkHint = data?.resetLink ? `\n\nLien reset: ${data.resetLink}` : '';
      Alert.alert(t('auth.forgot.requestedTitle'), `${baseMessage}${otpHint}${resetLinkHint}`);
    } catch (error) {
      Alert.alert(t('auth.forgot.requestFailedTitle'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otpId || !otpCode || !newPassword) {
      Alert.alert(t('auth.forgot.missingInfoTitle'), t('auth.forgot.missingResetInfo'));
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ otpId, code: otpCode, newPassword }),
      });
      Alert.alert(t('auth.forgot.successTitle'), t('auth.forgot.successBody'));
      navigation.navigate('SignIn');
    } catch (error) {
      Alert.alert(t('auth.forgot.resetFailedTitle'), error.message);
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
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={['#7A30FF', '#FF6A3D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Ionicons name="pulse" size={20} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{t('auth.forgot.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.forgot.subtitle')}</Text>

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

          {otpId ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>{t('common.otpCode')}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#97A1B3" />
                  <TextInput
                    placeholder="123456"
                    placeholderTextColor="#9AA5B5"
                    keyboardType="number-pad"
                    style={styles.input}
                    value={otpCode}
                    onChangeText={setOtpCode}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('common.newPassword')}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#97A1B3" />
                  <TextInput
                    placeholder="********"
                    placeholderTextColor="#9AA5B5"
                    secureTextEntry
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>
              </View>
            </>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.submitButtonWrap}
            onPress={otpId ? handleResetPassword : handleRequestReset}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#7A30FF', '#FF6A3D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>
                {otpId ? t('auth.forgot.resetButton') : t('auth.forgot.sendOtp')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backRow}
            activeOpacity={0.8}
            onPress={handleBackToLogin}
          >
            <Ionicons name="arrow-back" size={16} color="#475569" />
            <Text style={styles.backText}>{t('auth.forgot.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
