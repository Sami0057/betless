import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/auth.store';
import { colors, spacing, radius, fonts } from '../src/lib/theme';

export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  async function handleRegister() {
    if (!form.username || !form.email || !form.password) { Alert.alert('Error', 'Please fill all fields'); return; }
    if (form.password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }
    try {
      await register(form);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      Alert.alert('Registration Failed', msg || 'Please try again');
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join 12,000+ Saudi League predictors</Text>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              value={form.username}
              onChangeText={(t) => setForm({ ...form, username: t.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              placeholder="Username (letters, numbers, _)"
              placeholderTextColor={colors.gray[600]}
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
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
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
              placeholder="Password (8+ chars, uppercase, number)"
              placeholderTextColor={colors.gray[600]}
              secureTextEntry={!showPass}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={isLoading} style={[styles.btn, isLoading && { opacity: 0.6 }]}>
            <LinearGradient colors={[colors.green, colors.greenDark]} style={styles.btnGrad}>
              <Text style={styles.btnText}>{isLoading ? 'Creating...' : 'Create Account'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By registering, you agree to our Terms of Service and Privacy Policy. No real money involved.
          </Text>

          <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: colors.green }}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  scroll: { flexGrow: 1, padding: spacing.xl },
  title: { color: colors.white, fontSize: 28, ...fonts.black, marginTop: spacing.lg, marginBottom: 8 },
  subtitle: { color: colors.gray[400], fontSize: 15, marginBottom: spacing.xl },
  form: { gap: spacing.md },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dark, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: colors.white, fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  btn: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.sm },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: colors.black, fontSize: 16, ...fonts.bold },
  terms: { color: colors.gray[600], fontSize: 12, textAlign: 'center', lineHeight: 18 },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: { color: colors.gray[400], fontSize: 14 },
});
