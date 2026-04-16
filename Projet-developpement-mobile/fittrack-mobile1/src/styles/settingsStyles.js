import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 19,
  },
  emptySlot: {
    width: 38,
    height: 38,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 19,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  previewTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  previewText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 20,
  },
});

