import { Text, View } from 'react-native';

import { accueilStyles as styles } from '../styles/accueilStyles';

const highlights = [
  { value: '50K+', label: 'Active Users' },
  { value: '1M+', label: 'Activities Logged' },
  { value: '4.9/5', label: 'User Rating' },
  { value: '100%', label: 'Free Forever' },
];

export default function HighlightsStats() {
  return (
    <View style={styles.highlightsSection}>
      <View style={styles.highlightsRow}>
        {highlights.map((item) => (
          <View key={item.label} style={styles.highlightItem}>
            <Text style={styles.highlightValue}>{item.value}</Text>
            <Text style={styles.highlightLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.highlightsBottomLine} />
    </View>
  );
}
