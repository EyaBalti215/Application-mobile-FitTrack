import { StyleSheet } from 'react-native';

export const forgotPasswordStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F2F7',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#1A2032',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 8,
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 12,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#101828',
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 19,
    color: '#667085',
  },
  field: {
    marginTop: 18,
    alignSelf: 'stretch',
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#2B3648',
  },
  inputWrap: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E4E8F1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#1E293B',
  },
  submitButtonWrap: {
    marginTop: 18,
    alignSelf: 'stretch',
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  backRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#475569',
  },
});

