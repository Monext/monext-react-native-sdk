import React, {useState} from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  PaymentButton,
  presentPaymentSheet,
  type MnxtSDKContext,
  type PaymentSheetResult,
} from 'monext-react-native-sdk';

function formatResult(result: PaymentSheetResult): string {
  return JSON.stringify(result, null, 2);
}

const context: MnxtSDKContext = {
  environment: 'sandbox',
  appearance: {
    primaryColor: '#0000ff',
    secondaryColor: '#0000ff',
    confirmationColor: '#0000ff',
    errorColor: '#ff0000',
  },
};

function App(): React.JSX.Element {
  const [sessionToken, setSessionToken] = useState('');
  const [result, setResult] = useState<string>('No payment result yet');
  const [loading, setLoading] = useState(false);

  function handleResult(paymentResult: PaymentSheetResult) {
    setResult(formatResult(paymentResult));
  }

  function handleError(error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Payment sheet failed';
    setResult(message);
    Alert.alert('Payment error', message);
  }

  async function checkoutImperatively() {
    if (!sessionToken.trim() || loading) {
      return;
    }

    setLoading(true);
    try {
      const paymentResult = await presentPaymentSheet(
        sessionToken.trim(),
        context,
      );
      handleResult(paymentResult);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  const hasSessionToken = Boolean(sessionToken.trim());

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

        <Text style={styles.label}>
          1. Imperative — presentPaymentSheet()
        </Text>
        <Pressable
          disabled={!hasSessionToken || loading}
          onPress={checkoutImperatively}
          style={({pressed}) => [
            styles.button,
            (!hasSessionToken || loading || pressed) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Opening...' : 'Checkout'}
          </Text>
        </Pressable>

        <Text style={styles.label}>2. Declarative — &lt;PaymentButton&gt;</Text>
        <PaymentButton
          context={context}
          onError={handleError}
          onResult={handleResult}
          sessionToken={sessionToken.trim()}
          style={({pressed}) => [
            styles.button,
            (!hasSessionToken || pressed) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>Checkout</Text>
        </PaymentButton>

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
  button: {
    alignItems: 'center',
    backgroundColor: '#0057ff',
    borderRadius: 6,
    paddingVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  result: {
    color: '#374151',
    fontFamily: 'monospace',
    marginTop: 12,
  },
});

export default App;
