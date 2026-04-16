import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { accueilStyles as styles } from '../styles/accueilStyles';

function MetricRow({ icon, label, value, growth, iconBoxStyle }) {
  return (
    <View style={styles.metricRow}>
      <View style={[styles.metricIconBox, iconBoxStyle]}>{icon}</View>
      <View style={styles.metricTextWrap}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <Text style={styles.metricGrowth}>{growth}</Text>
    </View>
  );
}

export default function StatsCard() {
  return (
    <LinearGradient
      colors={['#8D2CFF', '#FF4D00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statsCardBorder}
    >
      <View style={styles.statsCardInner}>
        <View style={styles.statsCardHeader}>
          <View>
            <Text style={styles.statsCardEyebrow}>Today&apos;s progress</Text>
            <Text style={styles.statsCardTitle}>Activity snapshot</Text>
          </View>

          <View style={styles.statsCardBadge}>
            <Ionicons name="flame" size={18} color="#FF8A00" />
            <Text style={styles.statsCardBadgeText}>Hot</Text>
          </View>
        </View>

        <MetricRow
          label="Today's Run"
          value="8.5 km"
          growth="+12%"
          iconBoxStyle={styles.blueBox}
          icon={<Ionicons name="footsteps-outline" size={18} color="#FFFFFF" />}
        />

        <MetricRow
          label="Cycling"
          value="450 kcal"
          growth="+8%"
          iconBoxStyle={styles.orangeBox}
          icon={
            <MaterialCommunityIcons name="bike-fast" size={18} color="#FFFFFF" />
          }
        />

        <MetricRow
          label="Gym Session"
          value="50 min"
          growth="+15%"
          iconBoxStyle={styles.purpleBox}
          icon={
            <MaterialCommunityIcons name="dumbbell" size={16} color="#FFFFFF" />
          }
        />

        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>12k</Text>
            <Text style={styles.summaryLabel}>steps</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>82%</Text>
            <Text style={styles.summaryLabel}>goal</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>7d</Text>
            <Text style={styles.summaryLabel}>streak</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
