import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const API_URL = 'http://10.66.31.87:5000/api/auth/login';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Information', 'Please enter your email and password.');
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
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

     if (!response.ok) {
  Alert.alert('Login Failed', data.message || 'Invalid email or password.');
  return;
}

await AsyncStorage.setItem(
  '@find_scholar_token',
  data.token
);

await AsyncStorage.setItem(
  '@find_scholar_user',
  JSON.stringify(data.user)
);

await AsyncStorage.setItem(
  '@find_scholar_profile',
  JSON.stringify({
    educationLevel: data.user.educationLevel,
    course: data.user.course,
    fieldOfStudy: data.user.fieldOfStudy,
    state: data.user.state,
    category: data.user.category,
    familyIncome: data.user.annualIncome,
  })
);

Alert.alert('Success', 'Login successful!', [
  {
    text: 'Continue',
    onPress: () => router.replace('/(tabs)'),
  },
]);
    } catch (error) {
      console.error('Login error:', error);

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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Find Scholar</Text>
          <Text style={styles.subtitle}>
            Find the right scholarship for you
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome back 👋</Text>

          <Text style={styles.description}>
            Login to continue finding scholarships made for you.
          </Text>

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
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 45,
  },

  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: '#172554',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
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

  loginButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },

  signupText: {
    fontSize: 13,
    color: '#64748B',
  },

  signupLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
});