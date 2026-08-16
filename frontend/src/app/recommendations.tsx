import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL =
  'https://find-scholar.onrender.com/api/scholarships/recommended';

const PROFILE_KEY = '@find_scholar_profile';

type Profile = {
  educationLevel: string;
  course: string;
  fieldOfStudy: string;
  state: string;
  category: string;
  gender: string;
  familyIncome: string;
};

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
  matchScore?: number;
  matchPercentage?: number;
  eligibilityStatus?: string;
  matchedCriteria?: string[];
  failedCriteria?: string[];
};

export default function RecommendationsScreen() {
  const router = useRouter();

  const [recommendations, setRecommendations] =
    useState<Scholarship[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');

      const storedProfile =
        await AsyncStorage.getItem(PROFILE_KEY);

      if (!storedProfile) {
        setError(
          'Please complete your profile before finding scholarships.'
        );
        return;
      }

      const profile: Profile =
        JSON.parse(storedProfile);

      const requiredFields = [
        profile.educationLevel,
        profile.course,
        profile.fieldOfStudy,
        profile.state,
        profile.category,
        profile.gender,
        profile.familyIncome,
      ];

      if (
        requiredFields.some(
          (field) => !field || !field.trim()
        )
      ) {
        setError(
          'Please complete all profile details before finding scholarships.'
        );
        return;
      }

      const queryParams = new URLSearchParams({
        educationLevel:
          profile.educationLevel,
        course:
          profile.course,
        fieldOfStudy:
          profile.fieldOfStudy,
        state:
          profile.state,
        category:
          profile.category,
        gender:
          profile.gender,
        annualIncome:
          profile.familyIncome,
      });

      const response = await fetch(
        `${API_URL}?${queryParams.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to generate recommendations.'
        );
      }

      if (Array.isArray(data)) {
        setRecommendations(data);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error(
        'Recommendation API error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load recommendations.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openScholarship = (
    scholarship: Scholarship
  ) => {
    router.push({
      pathname: '/scholarship-details',
      params: {
        _id: scholarship._id,
        name: scholarship.name,
        provider: scholarship.provider,
        providerType:
          scholarship.providerType || '',
        description:
          scholarship.description || '',

        educationLevels: JSON.stringify(
          scholarship.educationLevels || []
        ),

        fieldsOfStudy: JSON.stringify(
          scholarship.fieldsOfStudy || []
        ),

        academicCriteria:
          scholarship.academicCriteria || '',

        incomeCriteria:
          scholarship.incomeCriteria || '',

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

        officialLink:
          scholarship.officialLink || '',

        lastVerified:
          scholarship.lastVerified || '',

        matchScore:
          String(
            scholarship.matchScore || 0
          ),

        matchedCriteria: JSON.stringify(
          scholarship.matchedCriteria || []
        ),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Recommended for You
            </Text>

            <Text style={styles.subtitle}>
              Scholarships matched to your profile
            </Text>
          </View>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>
              🎯
            </Text>
          </View>
        </View>

        {/* LOADING */}

        {loading && (
          <View style={styles.loadingState}>
            <ActivityIndicator
              size="large"
              color="#4F46E5"
            />

            <Text style={styles.loadingText}>
              Finding scholarships for you...
            </Text>
          </View>
        )}

        {/* ERROR */}

        {!loading && error !== '' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              ⚠️
            </Text>

            <Text style={styles.emptyTitle}>
              Unable to find recommendations
            </Text>

            <Text style={styles.emptyText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() =>
                router.push('/profile')
              }
            >
              <Text style={styles.profileButtonText}>
                Complete Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchRecommendations}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* RESULTS */}

        {!loading &&
          error === '' &&
          recommendations.length > 0 && (
            <>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultTitle}>
                    Your Matches
                  </Text>

                  <Text style={styles.resultSubtitle}>
                    {recommendations.length}{' '}
                    eligible scholarships found
                  </Text>
                </View>
              </View>

              {recommendations.map(
                (scholarship) => (
                  <TouchableOpacity
                    key={scholarship._id}
                    style={styles.scholarshipCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      openScholarship(
                        scholarship
                      )
                    }
                  >
                    {/* ICON */}

                    <View
                      style={
                        styles.scholarshipIcon
                      }
                    >
                      <Text
                        style={
                          styles.scholarshipIconText
                        }
                      >
                        🎓
                      </Text>
                    </View>

                    {/* INFORMATION */}

                    <View
                      style={
                        styles.scholarshipInfo
                      }
                    >
                      <Text
                        style={
                          styles.scholarshipName
                        }
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

                      {/* MATCH */}

                      <View
                        style={
                          styles.matchContainer
                        }
                      >
                        <Text
                          style={
                            styles.matchText
                          }
                        >
                          {scholarship.matchPercentage ||
                            scholarship.matchScore ||
                            0}
                          % match
                        </Text>
                      </View>

                      {/* TAGS */}

                      <View
                        style={styles.tagsRow}
                      >
                        {(
                          scholarship.educationLevels ||
                          []
                        )
                          .slice(0, 2)
                          .map((level) => (
                            <View
                              style={styles.tag}
                              key={`${scholarship._id}-${level}`}
                            >
                              <Text
                                style={
                                  styles.tagText
                                }
                              >
                                {level}
                              </Text>
                            </View>
                          ))}

                        {(
                          scholarship.fieldsOfStudy ||
                          []
                        )
                          .slice(0, 1)
                          .map((field) => (
                            <View
                              style={styles.tag}
                              key={`${scholarship._id}-${field}`}
                            >
                              <Text
                                style={
                                  styles.tagText
                                }
                              >
                                {field}
                              </Text>
                            </View>
                          ))}
                      </View>
                    </View>

                    {/* ARROW */}

                    <Text
                      style={styles.cardArrow}
                    >
                      →
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </>
          )}

        {/* NO MATCHES */}

        {!loading &&
          error === '' &&
          recommendations.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>
                🎓
              </Text>

              <Text style={styles.emptyTitle}>
                No matching scholarships
              </Text>

              <Text style={styles.emptyText}>
                We couldn't find scholarships that
                currently match all your eligibility
                requirements.
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchRecommendations}
              >
                <Text style={styles.retryText}>
                  Check Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* INFORMATION */}

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>
            ℹ️
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              How matching works
            </Text>

            <Text style={styles.infoText}>
              Recommendations are based on your
              education, course, field of study,
              state, category, gender and family
              income.
            </Text>
          </View>
        </View>
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
    marginBottom: 28,
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

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconText: {
    fontSize: 21,
  },

  loadingState: {
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 60,
  },

  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
  },

  resultHeader: {
    marginBottom: 15,
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  resultSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
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

  scholarshipIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  scholarshipIconText: {
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

  matchContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    marginTop: 7,
  },

  matchText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 7,
  },

  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  tagText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
  },

  cardArrow: {
    fontSize: 20,
    color: '#94A3B8',
    marginLeft: 7,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 65,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },

  profileButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },

  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  retryButton: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 10,
  },

  retryText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },

  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#312E81',
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#4F46E5',
    marginTop: 4,
  },
});