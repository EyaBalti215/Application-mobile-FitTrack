import { StyleSheet } from 'react-native';

export const heatmapStyles = StyleSheet.create({
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
  monthHeaderRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#111827',
  },
  weekdayRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  weekdayCell: {
    width: '14.2857%',
    alignItems: 'center',
  },
  weekdayText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  calendarGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  cellWrap: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: {
    width: 40,
    height: 46,
  },
  dayCell: {
    width: 40,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  selectedDayCell: {
    borderColor: '#7A30FF',
    borderWidth: 2,
  },
  dayText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#334155',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  countBadge: {
    minWidth: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignItems: 'center',
  },
  countText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  legendRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  selectedDateTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  emptyText: {
    marginTop: 8,
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  activityItem: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 2,
  },
  activityTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#0F172A',
  },
  activityMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#475569',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#B91C1C',
  },
});

