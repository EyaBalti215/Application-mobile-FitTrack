import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';

import { accueilStyles as styles } from '../styles/accueilStyles';
import { useSettings } from '../context/SettingsContext';

export default function CtaBanner() {
  const navigation = useNavigation();
  const { t } = useSettings();

  const handleGetStarted = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.ctaBannerWrap}>
      <LinearGradient
        colors={['#8C2EFF', '#FF4D00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ctaBanner}
      >
        <Text style={styles.ctaBannerTitle}>{t('accueil.cta.title')}</Text>
        <Text style={styles.ctaBannerSubtitle}>{t('accueil.cta.subtitle')}</Text>

        <TouchableOpacity
          style={styles.ctaBannerButton}
          activeOpacity={0.85}
          onPress={handleGetStarted}
        >
          <Text style={styles.ctaBannerButtonText}>{t('accueil.cta.button')}</Text>
          <Ionicons name="arrow-forward" size={16} color="#7A30FF" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
