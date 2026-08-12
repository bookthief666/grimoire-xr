/// <reference types="@capacitor/status-bar" />
/// <reference types="@capacitor/keyboard" />

import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.grimoire.app',
  appName: 'Grimoire',
  webDir: 'dist',
  backgroundColor: '#000000',
  plugins: {
    StatusBar: {
      // DARK means light foreground icons suitable for a dark background.
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#000000',
    },
    Keyboard: {
      // Native resize changes the WebView viewport, which keeps fixed bottom
      // sheets above the keyboard instead of letting the keyboard cover them.
      resize: KeyboardResize.Native,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
      autoBackdropColor: 'auto',
    },
  },
};

export default config;
