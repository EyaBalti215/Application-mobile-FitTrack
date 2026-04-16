import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';

import { accueilStyles as styles } from '../styles/accueilStyles';
import { useSettings } from '../context/SettingsContext';

export default function HeroHeader() {
  const navigation = useNavigation();
  const { t } = useSettings();

  const handleGetStarted = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.header}>
      <View style={styles.logoWrap}>
        <LinearGradient colors={['#7A30FF', '#FF5722']} style={styles.logoIcon}>
          <Ionicons name="pulse" size={16} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.logoText}>{t('app.name')}</Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleSignIn}>
          <Text style={styles.signIn}>{t('accueil.header.signIn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} onPress={handleGetStarted}>
          <LinearGradient
            colors={['#7A30FF', '#FF5722']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.getStartedButton}
          >
            <Text style={styles.getStartedText}>{t('accueil.header.getStarted')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
