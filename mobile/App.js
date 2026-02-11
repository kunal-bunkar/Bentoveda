import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  BackHandler,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const WEB_URL = 'http://10.19.108.8:3000'; // Network URL for mobile app access

function AppContent() {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const insets = useSafeAreaInsets();
  const safeAreaTop = insets.top || 40; // Default to 40px if not available

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
      if (state.isConnected && isOffline) {
        webViewRef.current?.reload();
      }
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
        return true;
      }
      return false;
    });

    return () => {
      unsubscribe();
      backHandler.remove();
    };
  }, [canGoBack, isOffline]);

  const injectedJavaScript = `
    (function() {
      document.documentElement.style.setProperty('--bento-safe-top', '${safeAreaTop}px');
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'safeAreaUpdate',
          safeAreaTop: ${safeAreaTop}
        }));
      }
      document.body.style.backgroundColor = '#f9fafb';
      true;
    })();
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'syncRequest' || data.message === 'Sync with Device') {
        Alert.alert(
          'Device Sync',
          'Do you want to sync with this device?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Sync',
              onPress: () => {
                const deviceData = {
                  deviceId: 'BENTO-99',
                  status: 'Synced',
                };

                const script = `
                  (function() {
                    const deviceData = ${JSON.stringify(deviceData)};
                    
                    if (window.handleDeviceSync) {
                      window.handleDeviceSync(deviceData);
                    }
                    
                    if (window.dispatchEvent) {
                      window.dispatchEvent(new MessageEvent('message', {
                        data: JSON.stringify(deviceData)
                      }));
                    }
                    
                    window.deviceSyncData = deviceData;
                    if (window.dispatchEvent) {
                      const event = new CustomEvent('deviceSync', { detail: deviceData });
                      window.dispatchEvent(event);
                    }
                    
                    true;
                  })();
                `;

                webViewRef.current?.injectJavaScript(script);
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(injectedJavaScript);
    }, 100);
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setLoading(false);
    if (nativeEvent.code === -8 || nativeEvent.description?.includes('ERR_CONNECTION')) {
      setIsOffline(true);
    }
  };

  const handleRetry = () => {
    setIsOffline(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  if (isOffline) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>
            Unable to connect to: {WEB_URL}
          </Text>
          <Text style={styles.errorSubMessage}>
            Please check:{'\n'}
            1. Web app is running{'\n'}
            2. IP address is correct{'\n'}
            3. Both devices on same WiFi
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        userAgent={`${Platform.select({
          ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          android: 'Mozilla/5.0 (Linux; Android 10)',
        })} BentoShell/1.0`}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  errorSubMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'left',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
