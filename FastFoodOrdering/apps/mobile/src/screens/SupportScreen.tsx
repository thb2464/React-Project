import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Reusable FAQ item
const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
  <View style={styles.faqItem}>
    <Text style={styles.question}>{question}</Text>
    <Text style={styles.answer}>{answer}</Text>
  </View>
);

export default function SupportScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="help-circle-outline" size={60} color="#007AFF" />
        <Text style={styles.title}>How can we help?</Text>
      </View>

      {/* Contact Options */}
      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call-outline" size={24} color="#007AFF" />
          <Text style={styles.contactText}>Call Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#007AFF" />
          <Text style={styles.contactText}>Live Chat</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <FaqItem
          question="Where is my order?"
          answer="You can track your order in real-time from the 'My Orders' tab."
        />
        <FaqItem
          question="How do I change my payment method?"
          answer="Go to 'Profile' > 'Payment Methods' to add or remove a card."
        />
        <FaqItem
          question="How is the delivery fee calculated?"
          answer="The delivery fee is a flat rate of $2.99 on all orders."
        />
      </View>
    </ScrollView>
  );
}

// Add the styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
  },
  contactButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  contactText: {
    marginTop: 8,
    color: '#007AFF',
    fontWeight: '500',
  },
  faqSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  answer: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});