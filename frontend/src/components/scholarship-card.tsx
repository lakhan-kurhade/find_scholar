import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type ScholarshipCardProps = {
  name: string;
  provider: string;
  description: string;
  match?: number;
  onPress?: () => void;
};

export default function ScholarshipCard({
  name,
  provider,
  description,
  match,
  onPress,
}: ScholarshipCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎓</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          <Text style={styles.provider} numberOfLines={1}>
            {provider}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.footer}>
        {match !== undefined && (
          <View style={styles.matchContainer}>
            <Text style={styles.matchText}>
              {match}% Match
            </Text>
          </View>
        )}

        <Text style={styles.details}>
          View Details →
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },

  pressed: {
    opacity: 0.8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 24,
  },

  titleContainer: {
    flex: 1,
    gap: Spacing.one,
  },

  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },

  provider: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.light.textSecondary,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  matchContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  matchText: {
    color: Colors.light.success,
    fontSize: 12,
    fontWeight: '700',
  },

  details: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});