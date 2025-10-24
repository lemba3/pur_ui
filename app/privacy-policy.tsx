import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <Stack.Screen options={{ title: 'Privacy Policy', headerBackTitle: 'Settings' }} />
      <LinearGradient
        colors={[myColors.gradient1, myColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.body}>Funds Verified LLC – Privacy Policy & Terms and Conditions
            Privacy Policy
            Funds Verified LLC (“Funds Verified,” “we,” “our,” or “us”) respects your privacy and is committed to protecting your personal and financial information. This Privacy Policy describes how we collect, use, and share information through our app and services (“Services”), including the $2 USD fee per proof of funds report.
            1. Information We Collect
            We collect personal and financial information including your name, email, phone number, bank account data, and verification details provided via our third-party provider, Plaid Inc. We may also collect device data, IP address, and app usage analytics.
            2. Use of Information
            We use collected information to:
            Verify your financial capacity and generate proof of funds documentation (each report costs $2 USD)
            Facilitate secure connections to your financial institution via Plaid
            Improve our Services, ensure compliance, and provide customer support
            3. Data Sharing
            We share information only with:
            Plaid, to enable secure access to your financial accounts
            Regulatory or legal authorities when required by law
            Service providers under strict confidentiality obligations
            4. Security
            We implement technical and organizational safeguards to protect your information from unauthorized access or misuse. However, no system is completely secure, and you acknowledge that use of the internet carries inherent risks.
            5. User Rights
            You may request access, correction, or deletion of your data by contacting us at support@fundsverified.com.
            6. Data Retention
            We retain user data as required by law or business necessity to provide the Services and meet compliance requirements.
            7. Fees
            The app is free to download.
            Each verified proof of funds report costs $2 USD, payable through your app store account. Users must confirm purchase before any fee is charged. Refunds are subject to app store policies.
            8. Compliance
            Funds Verified LLC operates under U.S. data protection laws, including the California Consumer Privacy Act (CCPA) and Gramm-Leach-Bliley Act (GLBA).
            9. Contact
            Questions or concerns may be directed to: support@fundsverified.com
            Terms and Conditions
            By using Funds Verified LLC’s app or website (“Services”), you agree to the following Terms and Conditions. If you do not agree, do not access or use the Services.
            1. Services
            Funds Verified provides financial verification tools that allow users to securely connect their bank accounts through Plaid to verify funds and generate official proof of funds documentation. We do not provide financial advice, lending, or banking services.
            2. Eligibility
            You must be at least 18 years old and legally able to enter into binding agreements under applicable law.
            3. Fees and Payment
            The app is free to download.
            Each verified proof of funds report costs $2 USD.
            Payment is collected through your app store account, and users must confirm purchase before charges.
            Refunds are subject to app store policies.
            4. Third-Party Services
            Funds Verified uses Plaid Inc. to connect your financial accounts. By using our Services, you consent to Plaid’s privacy policy and terms. Funds Verified is not responsible for Plaid’s services or any errors in third-party systems.
            5. No Warranty
            Our Services are provided “as is” without any warranties of any kind, express or implied, including but not limited to accuracy, reliability, or fitness for a particular purpose.
            6. Limitation of Liability
            Funds Verified LLC, its affiliates, or officers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of or inability to use the Services.
            7. Indemnification
            You agree to indemnify and hold harmless Funds Verified LLC and its representatives from any claims, damages, or expenses arising from your use of the Services or violation of these Terms.
            8. Governing Law
            These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming, without regard to conflicts of law principles.
            9. Modifications
            Funds Verified reserves the right to modify this Privacy Policy and Terms at any time. Updates will be posted in the app or at www.fundsverified.com.
            Effective Date: October 25, 2025
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    color: Colors.dark.text,
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 15,
  },
});
