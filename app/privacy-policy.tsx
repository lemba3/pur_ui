import React from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { myColors } from '@/constants/my-constants';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import { usePrivacyPolicyContent } from '@/hooks/useContent';

export default function PrivacyPolicyScreen() {
  const { data: privacyPolicyContent, isLoading, error } = usePrivacyPolicyContent();

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.dark.text} />;
    }

    if (error) {
      return <Text style={styles.body}>Failed to load content.</Text>;
    }

    return privacyPolicyContent.map((item, index) => {
      switch (item.type) {
        case 'title':
          return <Text key={index} style={styles.title}>{item.text}</Text>;
        case 'heading':
          return <Text key={index} style={styles.heading}>{item.text}</Text>;
        case 'subheading':
          return <Text key={index} style={styles.subheading}>{item.text}</Text>;
        case 'paragraph':
          return <Text key={index} style={styles.body}>{item.text}</Text>;
        default:
          return null;
      }
    });
  };

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
          {renderContent()}
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
    textAlign: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 15,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 10,
    marginBottom: 5,
  },
  body: {
    fontSize: 16,
    color: Colors.dark.text,
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 15,
  },
});