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
import { Picker } from '@react-native-picker/picker';

const PROFILE_KEY = '@find_scholar_profile';
const API_URL = 'https://find-scholar.onrender.com/api/auth/profile';

type Profile = {
  educationLevel: string;
  course: string;
  fieldOfStudy: string;
  state: string;
  category: string;
  gender: string;
  familyIncome: string;
};

const defaultProfile: Profile = {
  educationLevel: '',
  course: '',
  fieldOfStudy: '',
  state: '',
  category: '',
  gender: '',
  familyIncome: '',
};

const educationLevels = [
  '10th',
  '12th',
  'UG',
  'PG',
  'PhD',
];

const courses = [
  'B.E.',
  'B.Tech',
  'B.Sc',
  'BCA',
  'BBA',
  'B.Com',
  'B.A.',
  'MBBS',
  'LLB',
  'M.E.',
  'M.Tech',
  'M.Sc',
  'MCA',
  'MBA',
  'M.Com',
  'M.A.',
  'Other',
];

const fieldsOfStudy = [
  'Engineering',
  'Computer Science',
  'Information Technology',
  'Science',
  'Commerce',
  'Arts',
  'Management',
  'Medicine',
  'Law',
  'Agriculture',
  'Pharmacy',
  'Architecture',
  'Other',
];

const states = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Other',
];

const categories = [
  'General',
  'OBC',
  'SC',
  'ST',
  'EWS',
];

const genders = [
  'Male',
  'Female',
  'Other',
];

const incomeRanges = [
  'Below ₹1 Lakh',
  '₹1 - ₹2.5 Lakh',
  '₹2.5 - ₹5 Lakh',
  '₹5 - ₹8 Lakh',
  '₹8 - ₹10 Lakh',
  'Above ₹10 Lakh',
];

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile>(defaultProfile);

  const [userName, setUserName] =
    useState('Student');

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const loadProfile = async () => {
    try {
      const storedUser =
        await AsyncStorage.getItem(
          '@find_scholar_user'
        );

      if (storedUser) {
        const user = JSON.parse(storedUser);

        setUserName(
          user.name || 'Student'
        );
      }

      const stored =
        await AsyncStorage.getItem(
          PROFILE_KEY
        );

      if (stored) {
        const parsed = JSON.parse(stored);

        setProfile({
          ...defaultProfile,
          ...parsed,
        });
      }
    } catch (error) {
      console.error(
        'Failed to load profile:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const updateField = (
    field: keyof Profile,
    value: string
  ) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProfile = async () => {
    try {
      const token =
        await AsyncStorage.getItem(
          '@find_scholar_token'
        );

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please login again.'
        );
        return;
      }

      const storedUser =
        await AsyncStorage.getItem(
          '@find_scholar_user'
        );

      const user = storedUser
        ? JSON.parse(storedUser)
        : null;

      if (!user?.gender) {
        Alert.alert(
          'Profile Error',
          'Gender information is missing. Please login again.'
        );
        return;
      }

      if (
        !profile.educationLevel ||
        !profile.course ||
        !profile.fieldOfStudy ||
        !profile.state ||
        !profile.category ||
        !profile.familyIncome
      ) {
        Alert.alert(
          'Incomplete Profile',
          'Please select all required profile fields.'
        );
        return;
      }

      const response = await fetch(
        API_URL,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            name:
              user.name || userName,
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
              user.gender,
            annualIncome:
              profile.familyIncome,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          'Update Failed',
          data.message ||
            'Unable to update profile.'
        );
        return;
      }

      await AsyncStorage.setItem(
        '@find_scholar_user',
        JSON.stringify(data.user)
      );

      await AsyncStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          educationLevel:
            data.user.educationLevel,
          course:
            data.user.course,
          fieldOfStudy:
            data.user.fieldOfStudy,
          state:
            data.user.state,
          category:
            data.user.category,
          gender:
            data.user.gender,
          familyIncome:
            data.user.annualIncome,
        })
      );

      setUserName(
        data.user.name || 'Student'
      );

      setEditing(false);

      Alert.alert(
        'Profile Saved',
        'Your profile has been updated successfully.'
      );
    } catch (error) {
      console.error(
        'Profile update error:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Make sure the backend is running.'
      );
    }
  };

  const displayValue = (
    value: string
  ) => {
    return value.trim() || 'Not specified';
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              My Profile
            </Text>

            <Text style={styles.subtitle}>
              Your scholarship preferences
            </Text>
          </View>

          <View
            style={styles.profileCircle}
          >
            <Text
              style={styles.profileIcon}
            >
              👤
            </Text>
          </View>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <View
            style={
              styles.largeProfileCircle
            }
          >
            <Text
              style={
                styles.largeProfileIcon
              }
            >
              👨‍🎓
            </Text>
          </View>

          <Text style={styles.studentName}>
            {userName}
          </Text>

          <Text
            style={
              styles.profileDescription
            }
          >
            Complete your profile to
            discover scholarships that
            match your eligibility.
          </Text>

          {!editing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                setEditing(true)
              }
            >
              <Text
                style={
                  styles.editButtonText
                }
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveProfile}
            >
              <Text
                style={
                  styles.saveButtonText
                }
              >
                Save Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* EDUCATION */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Education
          </Text>

          {editing ? (
            <>
              <DropdownField
                label="Education Level"
                value={
                  profile.educationLevel
                }
                options={
                  educationLevels
                }
                placeholder="Select education level"
                onChange={(value) =>
                  updateField(
                    'educationLevel',
                    value
                  )
                }
              />

              <DropdownField
                label="Course"
                value={profile.course}
                options={courses}
                placeholder="Select course"
                onChange={(value) =>
                  updateField(
                    'course',
                    value
                  )
                }
              />

              <DropdownField
                label="Field of Study"
                value={
                  profile.fieldOfStudy
                }
                options={
                  fieldsOfStudy
                }
                placeholder="Select field of study"
                onChange={(value) =>
                  updateField(
                    'fieldOfStudy',
                    value
                  )
                }
              />
            </>
          ) : (
            <>
              <InfoRow
                label="Education Level"
                value={displayValue(
                  profile.educationLevel
                )}
              />

              <InfoRow
                label="Course"
                value={displayValue(
                  profile.course
                )}
              />

              <InfoRow
                label="Field of Study"
                value={displayValue(
                  profile.fieldOfStudy
                )}
              />
            </>
          )}
        </View>

        {/* ELIGIBILITY */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Eligibility
          </Text>

          {editing ? (
            <>
              <DropdownField
                label="State"
                value={profile.state}
                options={states}
                placeholder="Select your state"
                onChange={(value) =>
                  updateField(
                    'state',
                    value
                  )
                }
              />

              <DropdownField
                label="Category"
                value={profile.category}
                options={categories}
                placeholder="Select category"
                onChange={(value) =>
                  updateField(
                    'category',
                    value
                  )
                }
              />

              <DropdownField
                label="Gender"
                value={profile.gender}
                options={genders}
                placeholder="Select gender"
                onChange={(value) =>
                  updateField(
                    'gender',
                    value
                  )
                }
              />

              <DropdownField
                label="Family Income"
                value={
                  profile.familyIncome
                }
                options={
                  incomeRanges
                }
                placeholder="Select annual family income"
                onChange={(value) =>
                  updateField(
                    'familyIncome',
                    value
                  )
                }
              />
            </>
          ) : (
            <>
              <InfoRow
                label="State"
                value={displayValue(
                  profile.state
                )}
              />

              <InfoRow
                label="Category"
                value={displayValue(
                  profile.category
                )}
              />

              <InfoRow
                label="Gender"
                value={displayValue(
                  profile.gender
                )}
              />

              <InfoRow
                label="Family Income"
                value={displayValue(
                  profile.familyIncome
                )}
              />
            </>
          )}
        </View>

        {/* PREFERENCES */}

        {!editing && (
          <View style={styles.section}>
            <Text
              style={styles.sectionTitle}
            >
              Scholarship Preferences
            </Text>

            <View
              style={
                styles.preferenceRow
              }
            >
              <View
                style={
                  styles.preferenceIcon
                }
              >
                <Text>🏛️</Text>
              </View>

              <View
                style={
                  styles.preferenceInfo
                }
              >
                <Text
                  style={
                    styles.preferenceTitle
                  }
                >
                  Scholarship Type
                </Text>

                <Text
                  style={
                    styles.preferenceValue
                  }
                >
                  Government & Private
                </Text>
              </View>
            </View>

            <View
              style={
                styles.preferenceRow
              }
            >
              <View
                style={
                  styles.preferenceIcon
                }
              >
                <Text>🌎</Text>
              </View>

              <View
                style={
                  styles.preferenceInfo
                }
              >
                <Text
                  style={
                    styles.preferenceTitle
                  }
                >
                  Study Location
                </Text>

                <Text
                  style={
                    styles.preferenceValue
                  }
                >
                  India & International
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* SAVED */}

        {!editing && (
          <TouchableOpacity
            style={styles.savedCard}
            onPress={() =>
              router.push('/saved')
            }
          >
            <View
              style={
                styles.savedIconContainer
              }
            >
              <Text
                style={styles.savedIcon}
              >
                ♥
              </Text>
            </View>

            <View
              style={styles.savedInfo}
            >
              <Text
                style={styles.savedTitle}
              >
                Saved Scholarships
              </Text>

              <Text
                style={
                  styles.savedSubtitle
                }
              >
                View scholarships you've
                saved
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        )}

        {/* CANCEL */}

        {editing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setEditing(false);
              loadProfile();
            }}
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              Cancel
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>
          Your profile is stored securely
          on this device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------
   DROPDOWN FIELD
------------------------------------------------- */

function DropdownField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <View
      style={styles.inputContainer}
    >
      <Text
        style={styles.inputLabel}
      >
        {label}
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) =>
            onChange(itemValue)
          }
          style={styles.picker}
        >
          <Picker.Item
            label={placeholder}
            value=""
            color="#94A3B8"
          />

          {options.map((option) => (
            <Picker.Item
              key={option}
              label={option}
              value={option}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

/* -------------------------------------------------
   INFO ROW
------------------------------------------------- */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

/* -------------------------------------------------
   STYLES
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

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIcon: {
    fontSize: 20,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },

  largeProfileCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  largeProfileIcon: {
    fontSize: 38,
  },

  studentName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
  },

  profileDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 300,
  },

  editButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 16,
  },

  editButtonText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '800',
  },

  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 16,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

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
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '55%',
    textAlign: 'right',
  },

  inputContainer: {
    marginBottom: 14,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },

  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  picker: {
    height: 50,
    width: '100%',
    color: '#0F172A',
  },

  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  preferenceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  preferenceInfo: {
    flex: 1,
  },

  preferenceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  preferenceValue: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  savedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  savedIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  savedIcon: {
    fontSize: 20,
    color: '#EF4444',
  },

  savedInfo: {
    flex: 1,
    marginLeft: 12,
  },

  savedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  savedSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: '#94A3B8',
    marginLeft: 8,
  },

  cancelButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },

  footer: {
    fontSize: 11,
    lineHeight: 17,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
  },
});