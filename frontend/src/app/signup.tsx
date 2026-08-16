import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

const API_URL = 'http://10.66.31.87:5000/api/auth/signup';

export default function SignupScreen() {
  const router = useRouter();

  // Personal information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Education information
  const [educationLevel, setEducationLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [course, setCourse] = useState('');

  // Eligibility information
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !educationLevel ||
      !fieldOfStudy ||
      !course ||
      !state ||
      !category ||
      !gender ||
      !annualIncome
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          educationLevel,
          course,
          fieldOfStudy,
          state,
          category,
          gender,
          annualIncome,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Signup Failed',
          data.message || 'Unable to create account.'
        );
        return;
      }

      Alert.alert(
        'Account Created',
        'Your account has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Signup error:', error);

      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.logo}>Find Scholar</Text>

          <Text style={styles.subtitle}>
            Create your profile
          </Text>
        </View>

        {/* Main Form */}

        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.description}>
            Tell us about yourself so we can find scholarships
            that match your profile.
          </Text>

          {/* --------------------------------
              PERSONAL INFORMATION
          -------------------------------- */}

          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <Text style={styles.label}>Full Name</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
          />

          {/* --------------------------------
              EDUCATION INFORMATION
          -------------------------------- */}

          <Text style={styles.sectionTitle}>
            Education Information
          </Text>

          <Text style={styles.label}>
            Education Level
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={educationLevel}
              onValueChange={(value) =>
                setEducationLevel(value)
              }
            >
              <Picker.Item
                label="Select education level"
                value=""
              />

              <Picker.Item
                label="Diploma"
                value="Diploma"
              />

              <Picker.Item
                label="UG"
                value="UG"
              />

              <Picker.Item
                label="PG"
                value="PG"
              />

              <Picker.Item
                label="PhD"
                value="PhD"
              />
            </Picker>
          </View>

          <Text style={styles.label}>
            Field of Study
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fieldOfStudy}
              onValueChange={(value) => {
                setFieldOfStudy(value);
                setCourse('');
              }}
            >
              <Picker.Item
                label="Select field of study"
                value=""
              />

              <Picker.Item
                label="Engineering"
                value="Engineering"
              />

              <Picker.Item
                label="Computer Science"
                value="Computer Science"
              />

              <Picker.Item
                label="Commerce"
                value="Commerce"
              />

              <Picker.Item
                label="Arts"
                value="Arts"
              />

              <Picker.Item
                label="Science"
                value="Science"
              />

              <Picker.Item
                label="Management"
                value="Management"
              />

              <Picker.Item
                label="Law"
                value="Law"
              />

              <Picker.Item
                label="Pharmacy"
                value="Pharmacy"
              />
            </Picker>
          </View>

          <Text style={styles.label}>Course</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={course}
              onValueChange={(value) =>
                setCourse(value)
              }
            >
              <Picker.Item
                label="Select course"
                value=""
              />

              <Picker.Item
                label="B.Tech"
                value="B.Tech"
              />

              <Picker.Item
                label="B.E."
                value="B.E."
              />

              <Picker.Item
                label="Diploma Engineering"
                value="Diploma Engineering"
              />

              <Picker.Item
                label="BCA"
                value="BCA"
              />

              <Picker.Item
                label="B.Sc. Computer Science"
                value="B.Sc. Computer Science"
              />

              <Picker.Item
                label="MCA"
                value="MCA"
              />

              <Picker.Item
                label="B.Sc."
                value="B.Sc."
              />

              <Picker.Item
                label="M.Sc."
                value="M.Sc."
              />

              <Picker.Item
                label="B.Com"
                value="B.Com"
              />

              <Picker.Item
                label="M.Com"
                value="M.Com"
              />

              <Picker.Item
                label="B.A."
                value="B.A."
              />

              <Picker.Item
                label="M.A."
                value="M.A."
              />

              <Picker.Item
                label="BBA"
                value="BBA"
              />

              <Picker.Item
                label="MBA"
                value="MBA"
              />

              <Picker.Item
                label="B.Pharm"
                value="B.Pharm"
              />

              <Picker.Item
                label="M.Pharm"
                value="M.Pharm"
              />

              <Picker.Item
                label="LLB"
                value="LLB"
              />

              <Picker.Item
                label="LLM"
                value="LLM"
              />
            </Picker>
          </View>

          {/* --------------------------------
              ELIGIBILITY INFORMATION
          -------------------------------- */}

          <Text style={styles.sectionTitle}>
            Eligibility Information
          </Text>

          {/* State */}

          <Text style={styles.label}>State</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={state}
              onValueChange={(value) =>
                setState(value)
              }
            >
              <Picker.Item
                label="Select your state"
                value=""
              />

              <Picker.Item
                label="Maharashtra"
                value="Maharashtra"
              />

              <Picker.Item
                label="Gujarat"
                value="Gujarat"
              />

              <Picker.Item
                label="Karnataka"
                value="Karnataka"
              />

              <Picker.Item
                label="Goa"
                value="Goa"
              />

              <Picker.Item
                label="Delhi"
                value="Delhi"
              />

              <Picker.Item
                label="Tamil Nadu"
                value="Tamil Nadu"
              />

              <Picker.Item
                label="Telangana"
                value="Telangana"
              />

              <Picker.Item
                label="Rajasthan"
                value="Rajasthan"
              />

              <Picker.Item
                label="Madhya Pradesh"
                value="Madhya Pradesh"
              />

              <Picker.Item
                label="Uttar Pradesh"
                value="Uttar Pradesh"
              />

              <Picker.Item
                label="West Bengal"
                value="West Bengal"
              />

              <Picker.Item
                label="Other"
                value="Other"
              />
            </Picker>
          </View>

          {/* Category */}

          <Text style={styles.label}>
            Category
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(value) =>
                setCategory(value)
              }
            >
              <Picker.Item
                label="Select category"
                value=""
              />

              <Picker.Item
                label="Open"
                value="Open"
              />

              <Picker.Item
                label="OBC"
                value="OBC"
              />

              <Picker.Item
                label="SC"
                value="SC"
              />

              <Picker.Item
                label="ST"
                value="ST"
              />

              <Picker.Item
                label="EWS"
                value="EWS"
              />

              <Picker.Item
                label="VJNT"
                value="VJNT"
              />

              <Picker.Item
                label="SBC"
                value="SBC"
              />
            </Picker>
          </View>

          {/* Gender */}

          <Text style={styles.label}>
            Gender
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(value) =>
                setGender(value)
              }
            >
              <Picker.Item
                label="Select gender"
                value=""
              />

              <Picker.Item
                label="Male"
                value="Male"
              />

              <Picker.Item
                label="Female"
                value="Female"
              />

              <Picker.Item
                label="Prefer not to say"
                value="Prefer not to say"
              />
            </Picker>
          </View>

          {/* Annual Income */}

          <Text style={styles.label}>
            Annual Family Income
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={annualIncome}
              onValueChange={(value) =>
                setAnnualIncome(value)
              }
            >
              <Picker.Item
                label="Select annual income"
                value=""
              />

              <Picker.Item
                label="Below ₹1 Lakh"
                value="Below ₹1 lakh"
              />

              <Picker.Item
                label="₹1–2.5 Lakh"
                value="₹1–2.5 lakh"
              />

              <Picker.Item
                label="₹2.5–5 Lakh"
                value="₹2.5–5 lakh"
              />

              <Picker.Item
                label="₹5–8 Lakh"
                value="₹5–8 lakh"
              />

              <Picker.Item
                label="Above ₹8 Lakh"
                value="Above ₹8 lakh"
              />
            </Picker>
          </View>

          {/* Create Account */}

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signupButtonText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login */}

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginLink}>
                {' '}Login
              </Text>
            </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172554',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    marginTop: 7,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 15,
    marginTop: 5,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 17,
    backgroundColor: '#F8FAFC',
  },

  pickerContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginBottom: 17,
    justifyContent: 'center',
  },

  signupButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },

  loginText: {
    fontSize: 13,
    color: '#64748B',
  },

  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
});