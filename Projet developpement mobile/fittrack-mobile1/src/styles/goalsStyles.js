import { StyleSheet } from 'react-native';

export const goalsStyles = StyleSheet.create({
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#111827',
  },
  summaryLabel: {
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
    gap: 10,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#111827',
  },
  description: {
    marginTop: -4,
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#4B5563',
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
  goalItem: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  goalMainInfo: {
    flex: 1,
    gap: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#111827',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
  },
  ringOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  ringValueArc: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: '#7A30FF',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#111827',
  },
  goalMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7A30FF',
  },
  progressSuccess: {
    backgroundColor: '#16A34A',
  },
  progressFailed: {
    backgroundColor: '#EF4444',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#4B5563',
  },
  deleteText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#DC2626',
  },
});

