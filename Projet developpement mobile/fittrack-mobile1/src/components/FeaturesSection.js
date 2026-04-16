import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import { accueilStyles as styles } from '../styles/accueilStyles';
import { useSettings } from '../context/SettingsContext';

export default function FeaturesSection() {
  const { t } = useSettings();

  const features = [
    {
      title: t('accueil.features.trackTitle'),
      desc: t('accueil.features.trackBody'),
      icon: <Ionicons name="pulse" size={20} color="#FFFFFF" />,
      colors: ['#1D8EEA', '#10B4E6'],
    },
    {
      title: t('accueil.features.goalsTitle'),
      desc: t('accueil.features.goalsBody'),
      icon: <MaterialCommunityIcons name="target" size={20} color="#FFFFFF" />,
      colors: ['#7A30FF', '#F443B4'],
    },
    {
      title: t('accueil.features.progressTitle'),
      desc: t('accueil.features.progressBody'),
      icon: <Ionicons name="stats-chart" size={20} color="#FFFFFF" />,
      colors: ['#06B95A', '#0FD178'],
    },
    {
      title: t('accueil.features.caloriesTitle'),
      desc: t('accueil.features.caloriesBody'),
      icon: <Ionicons name="flash-outline" size={20} color="#FFFFFF" />,
      colors: ['#FF7B00', '#FF3D3D'],
    },
  ];

  return (
    <View style={styles.featuresSection}>
      <Text style={styles.featuresTitle}>{t('accueil.features.title')}</Text>
      <Text style={styles.featuresSubtitle}>{t('accueil.features.subtitle')}</Text>

      <View style={styles.featuresImageWrap}>
        <Image
          source={require('../../assets/img2.jpg')}
          style={styles.featuresImage}
        />
      </View>

      <View style={styles.featuresGrid}>
        {features.map((item) => (
          <View key={item.title} style={styles.featureCard}>
            <LinearGradient colors={item.colors} style={styles.featureIconWrap}>
              {item.icon}
            </LinearGradient>

            <Text style={styles.featureTitle}>{item.title}</Text>
            <Text style={styles.featureDescription}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
