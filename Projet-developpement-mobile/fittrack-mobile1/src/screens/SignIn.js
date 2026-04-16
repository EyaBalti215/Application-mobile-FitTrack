import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useContext, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { signInStyles as styles } from '../styles/signInStyles';
import { apiRequest } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function SignIn() {
  const navigation = useNavigation();
  const { setToken } = useContext(AuthContext);
  const { t } = useSettings();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const highlights = [
    { icon: 'pulse', label: t('auth.signIn.highlights.track') },
    { icon: 'trophy', label: t('auth.signIn.highlights.goals') },
    { icon: 'stats-chart', label: t('auth.signIn.highlights.progress') },
    { icon: 'flash', label: t('auth.signIn.highlights.calories') },
  ];

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Accueil');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.signIn.missingInfoTitle'), t('auth.signIn.missingCredentials'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setOtpId(data.otpId);
      setOtpCode('');
      const otpMessage = data?.message || t('auth.signIn.otpSentBody');
      const otpHint = data?.otpCode ? `\n\nCode OTP: ${data.otpCode}` : '';
      Alert.alert(t('auth.signIn.otpSentTitle'), `${otpMessage}${otpHint}`);
    } catch (error) {
      Alert.alert(t('auth.signIn.loginFailedTitle'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpId || !otpCode) {
      Alert.alert(t('auth.signIn.missingInfoTitle'), t('auth.signIn.missingOtp'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otpId, code: otpCode }),
      });
      setToken(data.token);
      Alert.alert(t('auth.signIn.successTitle'), t('auth.signIn.successBody'));
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      Alert.alert(t('auth.signIn.otpFailedTitle'), error.message);
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
              <Text style={styles.logoSubtitle}>{t('auth.signIn.logoSubtitle')}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{t('auth.signIn.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('auth.signIn.heroSubtitle')}</Text>

          <View style={styles.heroList}>
            {highlights.map((item) => (
              <View key={item.label} style={styles.heroListItem}>
                <Ionicons name={item.icon} size={16} color="#FFFFFF" />
                <Text style={styles.heroListText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t('auth.signIn.formTitle')}</Text>
          <Text style={styles.formSubtitle}>{t('auth.signIn.formSubtitle')}</Text>

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

          {otpId ? (
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
          ) : null}

          <View style={styles.optionsRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>{t('auth.signIn.forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.submitButtonWrap}
            onPress={otpId ? handleVerifyOtp : handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#7A30FF', '#FF6A3D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>
                {otpId ? t('auth.signIn.verifyOtpButton') : t('auth.signIn.signInButton')}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.signUpText}>
            {t('auth.signIn.noAccount')}{' '}
            <Text style={styles.signUpLink} onPress={handleSignUp}>
              {t('auth.signIn.signUpFree')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
