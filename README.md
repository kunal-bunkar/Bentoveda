# BENTOVEDA INTERNSHIP CHALLENGE: THE HYBRID BRIDGE

A unified architecture where a single React web application serves both desktop browsers and a mobile shell, with bi-directional communication between the web and native layers.

## 📁 Project Structure

```
Bentoveda/
├── web/              # React web application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── Footer.js
│   │   │   └── MainContent.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
└── mobile/           # React Native mobile wrapper
    ├── App.js
    ├── package.json
    ├── app.json
    └── babel.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- For mobile: Expo CLI (`npm install -g expo-cli`)

### Web Application Setup

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The web application will be available at `http://localhost:3000`

### Mobile Application Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update the `WEB_URL` in `mobile/App.js`:
   - For local development: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

4. Start the Expo development server:
```bash
npm start
```

5. Run on device/emulator:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 🎯 Features Implemented

### Part A: Web Application (React)

✅ **User Agent Detection**: Identifies if User Agent contains "BentoShell"  
✅ **Dynamic UI**:
   - Browser View: Displays Sidebar, Footer, and "Sign Up" button
   - App View: Hides Sidebar/Footer, adds 40px top padding via CSS variable `var(--bento-safe-top)`

✅ **Bridge Trigger**: "Sync with Device" button
   - Browser: Logs "Device sync not available on web" to console
   - App: Uses `window.ReactNativeWebView.postMessage` to request Device ID

✅ **Data Handling**: Receives and displays data from the app without page refresh

### Part B: Mobile Wrapper (React Native)

✅ **UA Injection**: Appends "BentoShell/1.0" to WebView's userAgent  
✅ **JavaScript Injection**: Dynamically passes device's Safe Area (top inset) as CSS variable  
✅ **Bi-directional Communication**:
   - Listens for "Sync with Device" message from web
   - Shows native Alert on sync request
   - Sends JSON object back to web using `injectJavaScript`

✅ **Android/iOS Back Button**: 
   - Navigates web history if `canGoBack` is true
   - Exits app if at root

✅ **Loading State**: Custom native loading spinner that hides on `onLoadEnd`

### Part C: Performance & Polish

✅ **Error Handling**: Custom "Try Again" screen for offline/load failures  
✅ **No White Flash**: Background color set to prevent flash during initialization

## 📋 Strategy Explanations

### 1. Safe Area (Notch) Padding Handling

**Strategy**: The mobile app uses React Native's `SafeAreaProvider` and `useSafeAreaInsets` hook to get the actual safe area insets from the device. This value is then:

1. **Injected via JavaScript**: The safe area top value is injected into the web page using the `injectedJavaScript` prop of the WebView. This runs before the page loads and sets a CSS variable:

```javascript
document.documentElement.style.setProperty('--bento-safe-top', '${safeAreaTop}px');
```

2. **CSS Variable Usage**: The web app uses this CSS variable (`var(--bento-safe-top)`) to add padding at the top when in app view:

```css
:root {
  --bento-safe-top: 0px;
}
```

3. **Dynamic Updates**: The value is also sent via postMessage after page load to ensure the web app receives the latest safe area value, which is then used to update the CSS variable dynamically.

**Why this approach?**
- Works across different devices with varying notch sizes
- No hardcoded values
- Respects actual device safe areas
- CSS variable allows easy styling without JavaScript manipulation

### 2. Android Back Button Prevention

**Strategy**: The Android back button handling is implemented using React Native's `BackHandler` API:

1. **Navigation State Tracking**: The WebView's `onNavigationStateChange` callback tracks whether the WebView can navigate back (`canGoBack`).

2. **Back Handler Listener**: A `BackHandler.addEventListener` is set up that:
   - Checks if `canGoBack` is true
   - If true, calls `webViewRef.current.goBack()` to navigate web history
   - Returns `true` to prevent the default back button behavior (app exit)
   - If `canGoBack` is false (at root), allows the default behavior which exits the app

3. **Cleanup**: The listener is properly removed when the component unmounts to prevent memory leaks.

**Code Implementation**:
```javascript
const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
  if (canGoBack && webViewRef.current) {
    webViewRef.current.goBack();
    return true; // Prevent default behavior
  }
  // If at root, exit app (Android only)
  if (Platform.OS === 'android') {
    BackHandler.exitApp();
    return true;
  }
  return false;
});
```

**Why this approach?**
- Provides native-like navigation experience
- Prevents accidental app exits
- Respects web navigation history
- Only exits when truly at the root page

## 🔧 Technical Details

### Communication Flow

1. **Web → Native**: 
   - Web app calls `window.ReactNativeWebView.postMessage(JSON.stringify({type: 'syncRequest'}))`
   - Native app receives via `onMessage` handler
   - Native shows Alert dialog
   - On confirmation, native injects JavaScript with device data

2. **Native → Web**:
   - Native app uses `injectJavaScript()` to send data
   - Multiple methods used for compatibility:
     - MessageEvent dispatch
     - Custom event dispatch
     - Global variable assignment
   - Web app listens via `window.addEventListener('message')` and custom event listeners

### Styling

- **Web**: Tailwind CSS for modern, responsive styling
- **Mobile**: React Native StyleSheet for native performance

### Error Handling

- Network connectivity monitoring using `@react-native-community/netinfo`
- Custom error screen with retry functionality
- Graceful fallbacks for message parsing

---

**Built for Bentoveda Internship Challenge**
# Bentoveda
