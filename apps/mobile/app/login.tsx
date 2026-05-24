import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/auth.store';
import { colors, spacing, radius, fonts } from '../src/lib/theme';

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    try {
      await login(email.toLowerCase().trim(), password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      Alert.alert('Login Failed', msg || 'Invalid credentials');
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logo}>
          <LinearGradient colors={[colors.green, colors.greenDark]} style={styles.logoBox}>
            <Text style={styles.logoLetter}>B</Text>
          </LinearGradient>
          <Text style={styles.logoText}>BETLESS</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue predicting</Text>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={colors.gray[600]}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.gray[600]}
              secureTextEntry={!showPass}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.loginBtn, isLoading && { opacity: 0.6 }]}
          >
            <LinearGradient colors={[colors.green, colors.greenDark]} style={styles.loginBtnGrad}>
              <Text style={styles.loginBtnText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
            <Text style={styles.registerLinkText}>Don't have an account? <Text style={{ color: colors.green }}>Create one free</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  scroll: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.xl, justifyContent: 'center' },
  logoBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: colors.black, fontSize: 24, ...fonts.black },
  logoText: { color: colors.white, fontSize: 24, ...fonts.black },
  title: { color: colors.white, fontSize: 28, ...fonts.black, textAlign: 'center', marginBottom: 8 },
  subtitle: { color: colors.gray[400], fontSize: 15, textAlign: 'center', marginBottom: spacing.xl },
  form: { gap: spacing.md },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dark, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: colors.white, fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  loginBtn: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.sm },
  loginBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { color: colors.black, fontSize: 16, ...fonts.bold },
  registerLink: { alignItems: 'center', paddingVertical: 8 },
  registerLinkText: { color: colors.gray[400], fontSize: 14 },
});
