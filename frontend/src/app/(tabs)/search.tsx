
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

type ParamValue = string | string[] | undefined;

export default function SearchScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const categoryParam = Array.isArray(params.filter)
    ? params.filter[0]
    : params.filter;

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(
  categoryParam || 'All'
);
useEffect(() => {
  if (categoryParam) {
    setSelectedFilter(categoryParam);
  }
}, [categoryParam]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = [
    'All',
    'Government',
    'Private',
    'Engineering',
    'UG',
    'PG',
  ];

  const getParam = (value: ParamValue): string => {
    if (Array.isArray(value)) {
      return value[0] ?? '';
    }

    return value ?? '';
  };

  /*
   * Read category sent from Home screen
   */
  useEffect(() => {
    const category = getParam(params.category);

    if (category) {
      setSelectedFilter(category);
    }
  }, [params.category]);

  /*
   * Fetch scholarships
   */
  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Failed to fetch scholarships');
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setScholarships(data);
      } else {
        setScholarships([]);
      }
    } catch (err) {
      console.error('API Error:', err);

      setError(
        'Unable to load scholarships. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Search + category filter
   */
  const filteredScholarships = scholarships.filter(
    (scholarship) => {
      const searchText = search.toLowerCase().trim();

      const searchableText = [
        scholarship.name,
        scholarship.provider,
        scholarship.description,
        scholarship.providerType,
        ...(scholarship.educationLevels || []),
        ...(scholarship.fieldsOfStudy || []),
        ...(scholarship.eligibility || []),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        searchText === '' ||
        searchableText.includes(searchText);

      const matchesFilter =
        selectedFilter === 'All' ||
        scholarship.providerType === selectedFilter ||
        (scholarship.fieldsOfStudy || []).some(
          (field) =>
            field
              .toLowerCase()
              .includes(selectedFilter.toLowerCase())
        ) ||
        (scholarship.educationLevels || []).some(
          (level) =>
            level
              .toLowerCase()
              .includes(selectedFilter.toLowerCase())
        );

      return matchesSearch && matchesFilter;
    }
  );

  /*
   * Open scholarship details
   */
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
            <Text style={styles.title}>
              Find Scholarships
            </Text>

            <Text style={styles.subtitle}>
              Discover opportunities that match you
            </Text>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setSelectedFilter('All')}
          >
            <Text style={styles.filterIcon}>
              ☷
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>
            ⌕
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search scholarships..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() =>
                setSelectedFilter(filter)
              }
              style={[
                styles.filterChip,
                selectedFilter === filter &&
                  styles.activeFilterChip,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter &&
                    styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Category */}
        {selectedFilter !== 'All' && (
          <View style={styles.activeCategoryBox}>
            <Text style={styles.activeCategoryText}>
              Showing: {selectedFilter}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setSelectedFilter('All')
              }
            >
              <Text style={styles.clearText}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result Header */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>
            Scholarships
          </Text>

          {!loading && !error && (
            <Text style={styles.resultCount}>
              {filteredScholarships.length} found
            </Text>
          )}
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingState}>
            <ActivityIndicator
              size="large"
              color="#4F46E5"
            />

            <Text style={styles.loadingText}>
              Loading scholarships...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error !== '' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              ⚠️
            </Text>

            <Text style={styles.emptyTitle}>
              Could not load scholarships
            </Text>

            <Text style={styles.emptyText}>
              {error}
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

        {/* No Results */}
        {!loading &&
          error === '' &&
          filteredScholarships.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>
                🔍
              </Text>

              <Text style={styles.emptyTitle}>
                No scholarships found
              </Text>

              <Text style={styles.emptyText}>
                Try another search term or category.
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setSearch('');
                  setSelectedFilter('All');
                }}
              >
                <Text style={styles.retryText}>
                  Show All
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Results */}
        {!loading &&
          error === '' &&
          filteredScholarships.map(
            (scholarship) => (
              <TouchableOpacity
                key={scholarship._id}
                style={styles.scholarshipCard}
                activeOpacity={0.8}
                onPress={() =>
                  openScholarship(scholarship)
                }
              >
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>
                    🎓
                  </Text>
                </View>

                {/* Information */}
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

                  {/* Tags */}
                  <View style={styles.tagsRow}>
                    {(scholarship.educationLevels || [])
                      .slice(0, 2)
                      .map((level) => (
                        <View
                          style={styles.tag}
                          key={`${scholarship._id}-${level}`}
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
                          key={`${scholarship._id}-${field}`}
                        >
                          <Text style={styles.tagText}>
                            {field}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>

                {/* Arrow */}
                <Text style={styles.cardArrow}>
                  →
                </Text>
              </TouchableOpacity>
            )
          )}
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
    marginBottom: 20,
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

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterIcon: {
    fontSize: 24,
    color: '#4F46E5',
  },

  /* Search */

  searchBox: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 15,
  },

  searchIcon: {
    fontSize: 23,
    color: '#64748B',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },

  /* Filters */

  filterScroll: {
    marginBottom: 15,
  },

  filterContainer: {
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  activeFilterChip: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  /* Active category */

  activeCategoryBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  activeCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },

  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  /* Result Header */

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  resultTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },

  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  /* Loading */

  loadingState: {
    alignItems: 'center',
    paddingTop: 70,
  },

  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
  },

  /* Empty */

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
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },

  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Scholarship */

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

  cardArrow: {
    fontSize: 20,
    color: '#94A3B8',
    marginLeft: 7,
  },
});

