import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

const SAVED_KEY = '@find_scholar_saved';

type Scholarship = {
  _id: string;
  name: string;
  provider: string;
  providerType?: string;
  description?: string;
  educationLevels?: string[];
  fieldsOfStudy?: string[];
  academicCriteria?: string;
  incomeCriteria?: string;
  eligibility?: string[];
  benefits?: string[];
  documentsRequired?: string[];
  restrictions?: string[];
  location?: string[];
  officialLink?: string;
  lastVerified?: string;
};

export default function SavedScreen() {
  const router = useRouter();
  const [savedScholarships, setSavedScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedScholarships = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_KEY);

      if (saved) {
        setSavedScholarships(JSON.parse(saved));
      } else {
        setSavedScholarships([]);
      }
    } catch (error) {
      console.error('Failed to load saved scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedScholarships();
    }, [])
  );

  const removeScholarship = async (id: string) => {
    try {
      const updated = savedScholarships.filter(
        (scholarship) => scholarship._id !== id
      );

      await AsyncStorage.setItem(
        SAVED_KEY,
        JSON.stringify(updated)
      );

      setSavedScholarships(updated);
    } catch (error) {
      console.error('Failed to remove scholarship:', error);
    }
  };

  const confirmRemove = (scholarship: Scholarship) => {
    Alert.alert(
      'Remove Scholarship',
      `Remove "${scholarship.name}" from your saved scholarships?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeScholarship(scholarship._id),
        },
      ]
    );
  };

  const openDetails = (scholarship: Scholarship) => {
    router.push({
      pathname: '/scholarship-details',
      params: {
  _id: scholarship._id,
  name: scholarship.name,
        provider: scholarship.provider,
        providerType: scholarship.providerType || '',
        description: scholarship.description || '',
        educationLevels: JSON.stringify(
          scholarship.educationLevels || []
        ),
        fieldsOfStudy: JSON.stringify(
          scholarship.fieldsOfStudy || []
        ),
        academicCriteria: scholarship.academicCriteria || '',
        incomeCriteria: scholarship.incomeCriteria || '',
        eligibility: JSON.stringify(
          scholarship.eligibility || []
        ),
        benefits: JSON.stringify(
          scholarship.benefits || []
        ),
        documentsRequired: JSON.stringify(
          scholarship.documentsRequired || []
        ),
        restrictions: JSON.stringify(
          scholarship.restrictions || []
        ),
        location: JSON.stringify(
        scholarship.location || []
        ),
        officialLink: scholarship.officialLink || '',
        lastVerified: scholarship.lastVerified || '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Saved Scholarships</Text>
            <Text style={styles.subtitle}>
              Opportunities you've saved for later
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {savedScholarships.length}
            </Text>
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              Loading...
            </Text>
          </View>
        )}

        {/* Empty state */}
        {!loading && savedScholarships.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>♡</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No saved scholarships
            </Text>

            <Text style={styles.emptyText}>
              Save scholarships you're interested in and
              they'll appear here.
            </Text>

            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.browseButtonText}>
                Browse Scholarships
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Saved scholarships */}
        {!loading &&
          savedScholarships.map((scholarship) => (
            <TouchableOpacity
              key={scholarship._id}
              style={styles.scholarshipCard}
              onPress={() => openDetails(scholarship)}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🎓</Text>
              </View>

              <View style={styles.scholarshipInfo}>
                <Text
                  style={styles.scholarshipName}
                  numberOfLines={2}
                >
                  {scholarship.name}
                </Text>

                <Text
                  style={styles.provider}
                  numberOfLines={1}
                >
                  {scholarship.provider}
                </Text>

                <View style={styles.tagsRow}>
                  {(scholarship.educationLevels || [])
                    .slice(0, 2)
                    .map((level) => (
                      <View
                        style={styles.tag}
                        key={level}
                      >
                        <Text style={styles.tagText}>
                          {level}
                        </Text>
                      </View>
                    ))}

                  {(scholarship.fieldsOfStudy || [])
                    .slice(0, 1)
                    .map((field) => (
                      <View
                        style={styles.tag}
                        key={field}
                      >
                        <Text style={styles.tagText}>
                          {field}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => confirmRemove(scholarship)}
              >
                <Text style={styles.removeIcon}>♥</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 22,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  countText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },

  scholarshipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  icon: {
    fontSize: 22,
  },

  scholarshipInfo: {
    flex: 1,
  },

  scholarshipName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    color: '#0F172A',
  },

  provider: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 7,
  },

  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  tagText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4F46E5',
  },

  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
  },

  removeIcon: {
    fontSize: 18,
    color: '#EF4444',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 25,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 42,
    color: '#4F46E5',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },

  browseButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },

  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});