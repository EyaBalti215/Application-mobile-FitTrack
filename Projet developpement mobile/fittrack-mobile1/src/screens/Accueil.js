import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView } from 'react-native';

import HeroHeader from '../components/HeroHeader';
import CtaBanner from '../components/CtaBanner';
import FeaturesSection from '../components/FeaturesSection';
import HeroIntro from '../components/HeroIntro';
import HeroActions from '../components/HeroActions';
import { accueilStyles as styles } from '../styles/accueilStyles';

export default function Accueil() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader />
        <HeroIntro />
        <HeroActions />
        <FeaturesSection />
        <CtaBanner />
      </ScrollView>
    </SafeAreaView>
  );
}
