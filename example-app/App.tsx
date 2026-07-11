import React, {useState} from 'react';
import {Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View,} from 'react-native';
import {presentPaymentSheet,  type PaymentSheetResult,} from 'monext-react-native-sdk';

function formatResult(result: PaymentSheetResult): string {
  return JSON.stringify(result, null, 2);
}

function App(): React.JSX.Element {
  const [sessionToken, setSessionToken] = useState('');
  const [result, setResult] = useState<string>('No payment result yet');
  const [loading, setLoading] = useState(false);

  async function checkout() {
    if (!sessionToken.trim() || loading) {
      return;
    }

    setLoading(true);
    try {
      const paymentResult = await presentPaymentSheet(sessionToken.trim(), {
          environment: 'sandbox',
          appearance: {
              primaryColor: "blue",
              secondaryColor: "blue",
              confirmationColor: "blue",
              errorColor: "red",
          }
      });

      setResult(formatResult(paymentResult));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Payment sheet failed';
      setResult(message);
      Alert.alert('Payment error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Monext React Native example</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setSessionToken}
          placeholder="session token"
          style={styles.input}
          value={sessionToken}
        />
        <Button
          disabled={!sessionToken.trim() || loading}
          onPress={checkout}
          title={loading ? 'Opening...' : 'Checkout'}
        />
        <Text style={styles.result}>{result}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f7f7f8',
    flex: 1,
  },
  content: {
    gap: 12,
    padding: 24,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#c7c9d1',
    borderRadius: 6,
    borderWidth: 1,
    color: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  result: {
    color: '#374151',
    fontFamily: 'monospace',
    marginTop: 12,
  },
});

export default App;
