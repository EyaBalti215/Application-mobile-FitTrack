import { StyleSheet } from 'react-native';

export const progressStyles = StyleSheet.create({
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
  summaryCard: {
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
    marginTop: 4,
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#4B5563',
  },
  rateValue: {
    marginTop: 10,
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#7A30FF',
  },
  rateLabel: {
    marginTop: -6,
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#111827',
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#374151',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#111827',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#B91C1C',
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  itemRow: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMain: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#111827',
  },
  itemMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  itemStatus: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#A16207',
  },
  ok: {
    color: '#15803D',
  },
  ko: {
    color: '#B91C1C',
  },
});

