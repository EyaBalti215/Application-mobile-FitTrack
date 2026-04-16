import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import { accueilStyles as styles } from '../styles/accueilStyles';
import { useSettings } from '../context/SettingsContext';

export default function HeroIntro() {
  const { t } = useSettings();

  return (
    <View style={styles.heroRow}>
      <View style={styles.heroCopy}>
        <View style={styles.badge}>
          <Ionicons name="star" size={14} color="#7A30FF" />
          <Text style={styles.badgeText}>{t('accueil.intro.badge')}</Text>
        </View>

        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitleDark}>{t('accueil.intro.titleLine1')}</Text>
          <Text style={styles.heroTitleDark}>{t('accueil.intro.titleLine2')}</Text>
          <View style={styles.heroTitleLineMobile}>
            <Text style={styles.heroTitlePurple}>{t('accueil.intro.starts')}</Text>
            <Text style={styles.heroTitlePink}>{t('accueil.intro.here')}</Text>
          </View>
          <Text style={styles.heroDescription}>{t('accueil.intro.description')}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaPill}>
              <Ionicons name="flash" size={13} color="#7A30FF" />
              <Text style={styles.heroMetaText}>{t('accueil.intro.metaDaily')}</Text>
            </View>
            <View style={styles.heroMetaPill}>
              <Ionicons name="trophy" size={13} color="#7A30FF" />
              <Text style={styles.heroMetaText}>{t('accueil.intro.metaGoal')}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.heroImageWrap}>
        <Image
          source={require('../../assets/img1.jpg')}
          style={styles.heroImage}
        />
      </View>
    </View>
  );
}
