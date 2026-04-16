import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useSettings } from '../context/SettingsContext';
import { settingsStyles as styles } from '../styles/settingsStyles';

function OptionButton({ label, selected, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          borderColor: selected ? colors.tint : colors.border,
          backgroundColor: selected ? `${colors.tint}20` : colors.card,
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          { color: selected ? colors.tint : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function Settings() {
  const navigation = useNavigation();
  const { language, setLanguage, themeMode, setThemeMode, t, colors } = useSettings();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
          <View style={styles.emptySlot} />
        </View>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>{t('settings.subtitle')}</Text>
        </View>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.languageTitle')}</Text>
          <View style={styles.optionsRow}>
            <OptionButton
              label={t('settings.language.fr')}
              selected={language === 'fr'}
              onPress={() => setLanguage('fr')}
              colors={colors}
            />
            <OptionButton
              label={t('settings.language.en')}
              selected={language === 'en'}
              onPress={() => setLanguage('en')}
              colors={colors}
            />
          </View>
        </View>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.themeTitle')}</Text>
          <View style={styles.optionsRow}>
            <OptionButton
              label={t('settings.theme.light')}
              selected={themeMode === 'light'}
              onPress={() => setThemeMode('light')}
              colors={colors}
            />
            <OptionButton
              label={t('settings.theme.dark')}
              selected={themeMode === 'dark'}
              onPress={() => setThemeMode('dark')}
              colors={colors}
            />
          </View>
        </View>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>{t('settings.previewTitle')}</Text>
          <Text style={[styles.previewText, { color: colors.mutedText }]}>{t('settings.previewBody')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
