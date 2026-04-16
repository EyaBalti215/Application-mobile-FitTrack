import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

import { accueilStyles as styles } from '../styles/accueilStyles';
import { useSettings } from '../context/SettingsContext';

export default function HeroActions() {
  const navigation = useNavigation();
  const { t } = useSettings();

  const handleWatchDemo = () => {
    Linking.openURL('https://www.youtube.com/watch?v=A3GBwellcGU');
  };

  const handleGetStarted = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.ctaRow}>
      <TouchableOpacity activeOpacity={0.9} onPress={handleGetStarted}>
        <LinearGradient
          colors={['#7A30FF', '#FF5722']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryCta}
        >
          <Text style={styles.primaryCtaText}>{t('accueil.actions.primary')}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryCta}
        activeOpacity={0.85}
        onPress={handleWatchDemo}
      >
        <Text style={styles.secondaryCtaText}>{t('accueil.actions.secondary')}</Text>
        <Ionicons name="play" size={15} color="#475569" />
      </TouchableOpacity>
    </View>
  );
}
