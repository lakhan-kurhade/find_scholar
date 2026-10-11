
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const API_URL = 'https://find-scholar.onrender.com/api/scholarships';

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
  isActive?: boolean;
};

export default function HomeScreen() {
  const router = useRouter();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Failed to fetch scholarships');
      }

      const data = await response.json();

      setScholarships(data);
    } catch (error) {
      console.error('Home scholarship API error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openScholarship = (scholarship: Scholarship) => {
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

  const openCategory = (category: string) => {
    router.push({
      pathname: '/search',
      params: {
        filter: category,
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
            <Text style={styles.logo}>Find Scholar</Text>

            <Text style={styles.tagline}>
              Find the right scholarship for you
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileCircle}
            activeOpacity={0.8}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcome}>
            Welcome 👋
          </Text>

          <Text style={styles.heading}>
            Discover scholarships{'\n'}
            made for you.
          </Text>

          <Text style={styles.description}>
            Find scholarships based on your education, course,
            category and eligibility.
          </Text>
        </View>

        {/* Main Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => router.push('/recommendations')}
        >
          <Text style={styles.primaryButtonText}>
            Find Scholarships
          </Text>

          <Text style={styles.arrow}>
            →
          </Text>
        </TouchableOpacity>

        <View style={styles.authButtons}>
  
</View>

        {/* Quick Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Explore by category
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/search')}
          >
            <Text style={styles.seeAll}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>

          <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.8}
            onPress={() => openCategory('Engineering')}
          >
            <Text style={styles.categoryIcon}>
              🎓
            </Text>

            <Text style={styles.categoryTitle}>
              Engineering
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.8}
            onPress={() => openCategory('Government')}
          >
            <Text style={styles.categoryIcon}>
              🏛️
            </Text>

            <Text style={styles.categoryTitle}>
              Government
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.8}
            onPress={() => openCategory('Private')}
          >
            <Text style={styles.categoryIcon}>
              💼
            </Text>

            <Text style={styles.categoryTitle}>
              Private
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.8}
            onPress={() => openCategory('International')}
          >
            <Text style={styles.categoryIcon}>
              🌎
            </Text>

            <Text style={styles.categoryTitle}>
              International
            </Text>
          </TouchableOpacity>

        </View>

        {/* Popular Scholarships */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Popular scholarships
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/search')}
          >
            <Text style={styles.seeAll}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color="#4F46E5"
            />

            <Text style={styles.loadingText}>
              Loading scholarships...
            </Text>
          </View>
        )}

        {/* Real Scholarship Data */}
        {!loading &&
          scholarships.slice(0, 5).map((scholarship) => (
            <TouchableOpacity
              key={scholarship._id}
              style={styles.scholarshipCard}
              activeOpacity={0.8}
              onPress={() => openScholarship(scholarship)}
            >

              <View style={styles.scholarshipIcon}>
                <Text style={styles.scholarshipIconText}>
                  🎓
                </Text>
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

                <Text
                  style={styles.scholarshipMeta}
                  numberOfLines={1}
                >
                  {(scholarship.educationLevels || [])
                    .slice(0, 3)
                    .join(' • ')}
                </Text>

              </View>

              <Text style={styles.bookmark}>
                →
              </Text>

            </TouchableOpacity>
          ))}

        {/* No Data */}
        {!loading &&
          scholarships.length === 0 && (
            <View style={styles.noData}>
              <Text style={styles.noDataIcon}>
                🎓
              </Text>

              <Text style={styles.noDataTitle}>
                No scholarships available
              </Text>

              <Text style={styles.noDataText}>
                Make sure the backend is running and try again.
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchScholarships}
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Bottom Information */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>
            ℹ️
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Find opportunities with confidence
            </Text>

            <Text style={styles.infoText}>
              Scholarship information is provided to help you
              discover opportunities. Always verify the latest
              requirements on the official website.
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

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 35,
  },

  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172554',
  },

  tagline: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    fontSize: 20,
  },

  /* Welcome */

  welcomeSection: {
    marginBottom: 22,
  },

  welcome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },

  heading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#64748B',
  },

  /* Primary Button */

  primaryButton: {
    height: 58,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 10,
    marginTop: -2,
  },

  /* Section */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },

  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },

  /* Categories */

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },

  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  categoryIcon: {
    fontSize: 25,
    marginBottom: 12,
  },

  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },

  /* Scholarships */

  scholarshipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
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
    fontSize: 23,
  },

  scholarshipInfo: {
    flex: 1,
  },

  scholarshipName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },

  provider: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  scholarshipMeta: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 5,
  },

  bookmark: {
    fontSize: 22,
    color: '#4F46E5',
    marginLeft: 8,
  },

  /* Loading */

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 25,
  },

  loadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },

  /* No Data */

  noData: {
    alignItems: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  noDataIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  noDataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  noDataText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },

  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Information */

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 15,
    padding: 15,
    marginTop: 18,
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
  authButtons: {
  flexDirection: 'row',
  gap: 12,
  marginTop: -18,
  marginBottom: 32,
},

loginButton: {
  flex: 1,
  height: 50,
  borderRadius: 14,
  backgroundColor: '#FFFFFF',
  borderWidth: 1.5,
  borderColor: '#4F46E5',
  justifyContent: 'center',
  alignItems: 'center',
},

loginButtonText: {
  color: '#4F46E5',
  fontSize: 15,
  fontWeight: '700',
},

signupButton: {
  flex: 1,
  height: 50,
  borderRadius: 14,
  backgroundColor: '#4F46E5',
  justifyContent: 'center',
  alignItems: 'center',
},

signupButtonText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '700',
},
});