import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import MainContent from './components/MainContent';

function App() {
  const [isAppView, setIsAppView] = useState(false);
  const [deviceData, setDeviceData] = useState(null);
  const [safeAreaTop, setSafeAreaTop] = useState(40); // Default 40px for notch simulation

  useEffect(() => {
    // Check if User Agent contains "BentoShell"
    const userAgent = navigator.userAgent || '';
    const isBentoShell = userAgent.includes('BentoShell');
    setIsAppView(isBentoShell);

    // Update CSS variable for safe area (40px default for app view, 0 for browser)
    const topPadding = isBentoShell ? safeAreaTop : 0;
    document.documentElement.style.setProperty('--bento-safe-top', `${topPadding}px`);
  }, [safeAreaTop]);

  useEffect(() => {
    // Listen for messages from React Native WebView
    if (isAppView && window.ReactNativeWebView) {
      // React Native WebView sends messages via window.addEventListener
      const messageHandler = (event) => {
        // React Native WebView messages come through window
        if (event.data) {
          handleMessage({ data: event.data });
        }
      };
      
      // Also listen for custom deviceSync events
      const deviceSyncHandler = (event) => {
        if (event.detail) {
          handleMessage({ data: event.detail });
        }
      };
      
      // Create a global handler function that can be called directly from injected JS
      window.handleDeviceSync = (data) => {
        handleMessage({ data });
      };
      
      window.addEventListener('message', messageHandler);
      window.addEventListener('deviceSync', deviceSyncHandler);
      
      // Also check for deviceSyncData periodically (fallback)
      const checkInterval = setInterval(() => {
        if (window.deviceSyncData) {
          handleMessage({ data: window.deviceSyncData });
          window.deviceSyncData = null;
        }
      }, 500);
      
      return () => {
        window.removeEventListener('message', messageHandler);
        window.removeEventListener('deviceSync', deviceSyncHandler);
        clearInterval(checkInterval);
        delete window.handleDeviceSync;
      };
    }
  }, [isAppView]);

  const handleMessage = (event) => {
    try {
      let data;
      let rawData = event.data;
      
      if (typeof rawData === 'string') {
        try {
          data = JSON.parse(rawData);
        } catch (e) {
          if (window.deviceSyncData) {
            data = window.deviceSyncData;
            window.deviceSyncData = null;
          } else {
            return;
          }
        }
      } else {
        data = rawData;
      }

      if (data.type === 'safeAreaUpdate' && data.safeAreaTop !== undefined) {
        setSafeAreaTop(data.safeAreaTop);
      }

      if (data.type === 'deviceSync' || data.deviceId) {
        setDeviceData(data);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const handleSyncWithDevice = () => {
    if (isAppView && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'syncRequest',
          message: 'Sync with Device'
        })
      );
    } else {
      console.log('Device sync not available on web');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Safe area padding for app view (notch simulation) */}
      {isAppView && (
        <div 
          className="bg-white"
          style={{ 
            height: 'var(--bento-safe-top)',
            minHeight: 'var(--bento-safe-top)'
          }}
        />
      )}
      
      <div className="flex flex-1">
        {/* Sidebar - hidden in app view */}
        {!isAppView && <Sidebar />}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <MainContent 
            isAppView={isAppView}
            onSyncWithDevice={handleSyncWithDevice}
            deviceData={deviceData}
          />
          
          {/* Footer - hidden in app view */}
          {!isAppView && <Footer />}
        </div>
      </div>
    </div>
  );
}

export default App;
