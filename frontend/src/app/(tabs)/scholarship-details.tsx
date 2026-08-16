import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  isScholarshipSaved,
  toggleSavedScholarship,
  SavedScholarship,
} from '../../utils/savedScholarships';

type ParamValue = string | string[] | undefined;

export default function ScholarshipDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isSaved, setIsSaved] = useState(false);

  const getParam = (value: ParamValue): string => {
    if (Array.isArray(value)) {
      return value[0] ?? '';
    }

    return value ?? '';
  };

  const parseArray = (value: ParamValue): string[] => {
    const stringValue = getParam(value);

    if (!stringValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(stringValue);

      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }

      return [];
    } catch {
      return [];
    }
  };

  const id = getParam(params._id);
  console.log('DETAILS SCHOLARSHIP ID:', id);
  const name = getParam(params.name);
  const provider = getParam(params.provider);
  const providerType = getParam(params.providerType);
  const description = getParam(params.description);
  const academicCriteria = getParam(params.academicCriteria);
  const incomeCriteria = getParam(params.incomeCriteria);
  const lastVerified = getParam(params.lastVerified);
  const location = parseArray(params.location);

  const officialLink =
    getParam(params.officialLink) ||
    getParam(params.applicationLink);

  const educationLevels = parseArray(params.educationLevels);
  const fieldsOfStudy = parseArray(params.fieldsOfStudy);
  const eligibility = parseArray(params.eligibility);
  const benefits = parseArray(params.benefits);
  const documentsRequired = parseArray(params.documentsRequired);
  const restrictions = parseArray(params.restrictions);

  /*
   * Check whether this scholarship is already saved
   */
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!id) {
        return;
      }

      const saved = await isScholarshipSaved(id);
      setIsSaved(saved);
    };

    checkSavedStatus();
  }, [id]);

  /*
   * Save / Unsave scholarship
   */
  const handleSave = async () => {
    if (!id) {
      Alert.alert(
        'Unable to save',
        'This scholarship does not have a valid ID.'
      );
      return;
    }

    const scholarship: SavedScholarship = {
      _id: id,
      name,
      provider,
      description,
      providerType,
      educationLevels,
      fieldsOfStudy,
      eligibility,
      benefits,
      documentsRequired,
      restrictions,
      academicCriteria,
      incomeCriteria,
      officialLink,
      lastVerified,
    };

    const newSavedState = await toggleSavedScholarship(scholarship);

    setIsSaved(newSavedState);
  };

  /*
   * Open official website
   */
  const openOfficialLink = async () => {
    if (!officialLink.trim()) {
      Alert.alert(
        'Link unavailable',
        'The official website link is not available for this scholarship.'
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(officialLink);

      if (!supported) {
        Alert.alert(
          'Unable to open link',
          'This website link cannot be opened on your device.'
        );
        return;
      }

      await Linking.openURL(officialLink);
    } catch {
      Alert.alert(
        'Unable to open link',
        'Something went wrong while opening the official website.'
      );
    }
  };

  const formattedVerifiedDate = lastVerified
    ? lastVerified.split('T')[0]
    : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎓</Text>
          </View>

          <Text style={styles.title}>
            {name || 'Scholarship'}
          </Text>

          <Text style={styles.provider}>
            {provider || 'Provider not available'}
          </Text>

          {providerType && (
            <View style={styles.providerBadge}>
              <Text style={styles.providerBadgeText}>
                {providerType}
              </Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaved && styles.savedButton,
            ]}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text
              style={[
                styles.saveIcon,
                isSaved && styles.savedIcon,
              ]}
            >
              {isSaved ? '♥' : '♡'}
            </Text>

            <Text
              style={[
                styles.saveButtonText,
                isSaved && styles.savedButtonText,
              ]}
            >
              {isSaved ? 'Saved' : 'Save Scholarship'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {description && (
          <Section title="About this scholarship">
            <Text style={styles.description}>
              {description}
            </Text>
          </Section>
        )}

        {/* Location */}
        {location.length > 0 && (
          <Section title="Location">
            <TagList items={location} />
          </Section>
        )}

        {/* Education Level */}
        {educationLevels.length > 0 && (
          <Section title="Education Level">
            <TagList items={educationLevels} />
          </Section>
        )}

        {/* Fields of Study */}
        {fieldsOfStudy.length > 0 && (
          <Section title="Fields of Study">
            <TagList items={fieldsOfStudy} />
          </Section>
        )}

        {/* Academic Criteria */}
        {academicCriteria && (
          <Section title="Academic Criteria">
            <Text style={styles.normalText}>
              {academicCriteria}
            </Text>
          </Section>
        )}

        {/* Income Criteria */}
        {incomeCriteria && (
          <Section title="Income Criteria">
            <Text style={styles.normalText}>
              {incomeCriteria}
            </Text>
          </Section>
        )}

        {/* Eligibility */}
        {eligibility.length > 0 && (
          <Section title="Eligibility">
            {eligibility.map((item, index) => (
              <BulletItem
                key={`${item}-${index}`}
                text={item}
              />
            ))}
          </Section>
        )}

        {/* Benefits */}
        {benefits.length > 0 && (
          <Section title="Benefits">
            {benefits.map((item, index) => (
              <BulletItem
                key={`${item}-${index}`}
                text={item}
              />
            ))}
          </Section>
        )}

        {/* Documents Required */}
        {documentsRequired.length > 0 && (
          <Section title="Documents Required">
            {documentsRequired.map((item, index) => (
              <BulletItem
                key={`${item}-${index}`}
                text={item}
              />
            ))}
          </Section>
        )}

        {/* Restrictions */}
        {restrictions.length > 0 && (
          <Section title="Important Conditions">
            {restrictions.map((item, index) => (
              <BulletItem
                key={`${item}-${index}`}
                text={item}
              />
            ))}
          </Section>
        )}

        {/* Verification */}
        {formattedVerifiedDate && (
          <View style={styles.verifiedBox}>
            <View style={styles.verifiedIconContainer}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>

            <View style={styles.verifiedInfo}>
              <Text style={styles.verifiedTitle}>
                Information Verified
              </Text>

              <Text style={styles.verifiedText}>
                Last verified: {formattedVerifiedDate}
              </Text>
            </View>
          </View>
        )}

        {/* Official Website */}
        {officialLink.trim() !== '' && (
          <TouchableOpacity
            style={styles.applyButton}
            activeOpacity={0.85}
            onPress={openOfficialLink}
          >
            <Text style={styles.applyButtonText}>
              Visit Official Website
            </Text>

            <Text style={styles.applyArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <Text style={styles.footerText}>
          Find Scholar provides information to help you discover
          opportunities. Always verify the latest eligibility,
          benefits and application requirements on the official
          website.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------
   Section Component
------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

/* -------------------------------------------------
   Tag List
------------------------------------------------- */

function TagList({
  items,
}: {
  items: string[];
}) {
  return (
    <View style={styles.tagContainer}>
      {items.map((item, index) => (
        <View
          style={styles.tag}
          key={`${item}-${index}`}
        >
          <Text style={styles.tagText}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------
   Bullet Item
------------------------------------------------- */

function BulletItem({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>

      <Text style={styles.bulletText}>
        {text}
      </Text>
    </View>
  );
}

/* -------------------------------------------------
   Styles
------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* Back */

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 15,
  },

  backArrow: {
    fontSize: 34,
    color: '#4F46E5',
    lineHeight: 34,
  },

  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 4,
  },

  /* Header */

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  icon: {
    fontSize: 32,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 29,
  },

  provider: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 7,
    textAlign: 'center',
  },

  providerBadge: {
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  providerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },

  /* Save */

  saveButton: {
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  savedButton: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  saveIcon: {
    fontSize: 22,
    color: '#4F46E5',
    marginRight: 8,
  },

  savedIcon: {
    color: '#FFFFFF',
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },

  savedButtonText: {
    color: '#FFFFFF',
  },

  /* Sections */

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },

  sectionContent: {
    width: '100%',
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },

  normalText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },

  /* Tags */

  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  /* Bullets */

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 9,
  },

  bullet: {
    fontSize: 18,
    color: '#4F46E5',
    marginRight: 9,
    lineHeight: 20,
  },

  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },

  /* Verification */

  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },

  verifiedIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  verifiedInfo: {
    marginLeft: 10,
    flex: 1,
  },

  verifiedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },

  verifiedText: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },

  /* Official Website */

  applyButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 15,
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  applyArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 10,
  },

  /* Footer */

  footerText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 18,
  },
});