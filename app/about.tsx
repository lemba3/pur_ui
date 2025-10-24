import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

const aboutText = "Welcome to our application! We are dedicated to providing the best service possible. Our team is passionate about technology and innovation, and we strive to create solutions that make a difference.\n\nThis application is a demonstration of our capabilities in building modern, secure, and user-friendly mobile apps. We hope you enjoy using it as much as we enjoyed building it. For any inquiries, please feel free to reach out through our support channels.";

export default function AboutScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <Stack.Screen options={{ title: 'About Us', headerBackTitle: 'Settings' }} />
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <Image source={require('@/assets/images/pur.png')} style={styles.logo} />
            <Text style={styles.title}>About Our App</Text>
          </View>
          <Text style={styles.body}>
            About Funds Verified
            Funds Verified is a secure fintech app that provides instant, bank-verified proof of funds.
            We connect directly to your financial institution using Plaid, ensuring your information is protected with bank-level encryption at all times.
            Whether you’re buying real estate, applying for financing, or verifying liquidity, Funds Verified helps you generate trusted and professional proof of funds documents in seconds — right from your phone.
            The app is free to download, and each proof of funds report costs $2 USD.
            Built in Wyoming, USA, by Funds Verified LLC, our mission is to make financial verification fast, transparent, and secure.
            Secure • Instant • Verified
            For support or inquiries, contact: support@fundsverified.com
          </Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: Colors.dark.text,
    opacity: 0.8,
    lineHeight: 24,
    textAlign: 'center',
  },
});
