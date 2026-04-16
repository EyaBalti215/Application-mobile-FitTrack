import { StyleSheet } from 'react-native';

export const simplePageStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#111827',
  },
  description: {
    marginTop: 6,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 20,
  },
});
