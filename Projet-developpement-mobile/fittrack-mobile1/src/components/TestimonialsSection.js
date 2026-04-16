import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { accueilStyles as styles } from '../styles/accueilStyles';

const testimonials = [
  {
    id: 'sarah',
    quote:
      '"FitTrack has completely transformed how I train. The insights are incredible!"',
    name: 'Sarah Johnson',
    role: 'Marathon Runner',
  },
  {
    id: 'mike',
    quote:
      '"Best fitness tracking app I\'ve ever used. Simple, beautiful, and effective."',
    name: 'Mike Chen',
    role: 'Fitness Enthusiast',
  },
  {
    id: 'emma',
    quote:
      '"Love the goal tracking feature! It keeps me motivated every single day."',
    name: 'Emma Davis',
    role: 'Yoga Instructor',
  },
];

export default function TestimonialsSection() {
  return (
    <View style={styles.testimonialsSection}>
      <Text style={styles.testimonialsTitle}>Loved by Fitness Enthusiasts</Text>
      <Text style={styles.testimonialsSubtitle}>See what our users have to say</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.testimonialsRow}
      >
        {testimonials.map((item) => (
          <View key={item.id} style={styles.testimonialCard}>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Ionicons key={`${item.id}-${index}`} name="star" size={18} color="#F4BE00" />
              ))}
            </View>

            <Text style={styles.testimonialQuote}>{item.quote}</Text>

            <View style={styles.authorRow}>
              <Text style={styles.authorEmoji}>🧑</Text>
              <View>
                <Text style={styles.authorName}>{item.name}</Text>
                <Text style={styles.authorRole}>{item.role}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
