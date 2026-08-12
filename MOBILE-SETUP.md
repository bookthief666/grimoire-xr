# Grimoire OS: complete Vite + Capacitor setup

This guide builds the application as a Capacitor WebView app. Keep the existing React, Tailwind, Framer Motion, Canvas, Web Audio, and browser code; do not translate it to React Native.

## 1. Prerequisites

- Node.js 22 or newer.
- macOS with a current Xcode release for iOS builds.
- Android Studio with its recommended Android SDK and JDK for Android builds.
- Apple and Google developer accounts for store signing and distribution.

Capacitor's current platform requirements are maintained in its [environment setup guide](https://capacitorjs.com/docs/getting-started/environment-setup).

## 2. Create the project from scratch

These commands reproduce the baseline used by this repository:

```bash
npm create vite@latest grimoire-app -- --template react
cd grimoire-app
npm install

npm install react@^18.2.0 react-dom@^18.2.0 framer-motion@^11 lucide-react@^0.344
npm install @fontsource/press-start-2p @fontsource/vt323

npm install @capacitor/core@^8 @capacitor/android@^8 @capacitor/ios@^8
npm install @capacitor/haptics@^8 @capacitor/status-bar@^8 @capacitor/keyboard@^8
npm install @capacitor/filesystem@^8 @capacitor/share@^8
npm install -D @capacitor/cli@^8

npm install -D tailwindcss@^3 postcss autoprefixer vitest
npx tailwindcss init -p
npx cap init Grimoire com.grimoire.app --web-dir dist
```

Copy in `src/App.jsx`, `src/main.jsx`, `src/index.css`, `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `capacitor.config.ts`, and `server/index.mjs` from this finished project.

The viewport must contain `viewport-fit=cover` so CSS safe-area environment variables receive real device values:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

The finished project intentionally does not use `user-scalable=no` or `maximum-scale=1`. Global `touch-action: manipulation` prevents double-tap zoom while leaving accessibility pinch zoom available.

## 3. Gemini API boundary

Never place `GEMINI_API_KEY` in `App.jsx`, `capacitor.config.ts`, or a `VITE_*` variable. Vite variables are public and native bundles can be inspected.

Create `.env.local` from `.env.example`:

```dotenv
GEMINI_API_KEY=your_server_only_key
GEMINI_TEXT_MODEL=gemini-3.6-flash
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
PORT=8787
ALLOWED_ORIGINS=http://localhost,http://localhost:5173,https://localhost,capacitor://localhost
VITE_GRIMOIRE_API_URL=
```

Run the server and browser app in separate terminals:

```bash
npm run api
npm run dev
```

The included Node server exposes:

- `GET /health`
- `POST /api/text`
- `POST /api/image`

It keeps the key server-side, validates input length, restricts browser/native origins, rate-limits by client address, and removes upstream credentials from client traffic. For a public commercial release, put it behind your normal user authentication, abuse monitoring, and provider-level quotas as well.

For native builds, deploy this server over HTTPS and set:

```dotenv
VITE_GRIMOIRE_API_URL=https://api.your-domain.example
```

This URL is public configuration; the Gemini key remains only on the server. Rebuild after changing a `VITE_*` value.

The current image request follows Google's [Gemini image-generation REST contract](https://ai.google.dev/gemini-api/docs/image-generation), including portrait `2:3`, `1K`, JPEG output.

## 4. Mobile behavior already applied

### Haptics

`useHaptic` calls `@capacitor/haptics`:

- forge: medium impact;
- Oracle: success notification;
- Spirit Box: light impact;
- ritual: short heavy/medium/success sequence.

All calls are caught because a missing motor or unavailable device API must never block the underlying action.

### Native feel

`src/index.css` disables WebView chrome with:

```css
html { touch-action: manipulation; overscroll-behavior: none; }
body {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

Inputs, textareas, contenteditable content, and explicit selectable content re-enable selection. Spirit Box and landing inputs use a 16px control font to avoid focus zoom in iOS WebViews.

### Safe areas

The fixed navigation height includes `env(safe-area-inset-top)`. Its content receives top/left/right insets. Fixed sheets, overlays, notices, the Spirit Box, and the audio button similarly include the relevant inset. Main views use `100dvh` and safe bottom padding.

Examples from the finished source:

```jsx
<nav className="h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] ..." />

<div className="pb-[calc(1rem+env(safe-area-inset-bottom))] ..." />
```

### Status bar

`capacitor.config.ts` and `useNativeShell` keep the native status bar visible, black, and configured with light foreground content. In Capacitor's status-bar enum, `DARK` means light text suitable for a dark background.

The generated iOS `Info.plist` already contains:

```xml
<key>UIViewControllerBasedStatusBarAppearance</key>
<true/>
```

### Keyboard

The Keyboard plugin uses native WebView resizing. The Spirit Box uses `dvh`, a `min-h-0` message scroller, safe bottom padding, `enterKeyHint="send"`, and IME-composition protection. Native keyboard listeners scroll the composer into view and are removed on React cleanup.

### Canvas

Pointer coordinates live in a ref so pointer movement does not recreate the animation effect. The Canvas scales to a device-pixel ratio capped at 2, owns exactly one animation frame loop, and cancels it at unmount.

### Archive export

Web builds still download an HTML file. Native builds write the complete standalone archive to the app cache with Capacitor Filesystem and open the platform share/save sheet with Capacitor Share.

## 5. Build and generate native projects

First prove the web build:

```bash
npm run check
```

From a fresh project, add platforms once:

```bash
npx cap add ios
npx cap add android
```

Do not run `cap add` in this finished repository; `ios/` and `android/` already exist.

After web, plugin, or native configuration changes:

```bash
npm run mobile:sync
```

That command builds Vite and runs `cap sync`. For a web-only change where native dependencies did not change, `npm run mobile:copy` is sufficient.

## 6. Xcode: run and archive iOS

On macOS:

```bash
npm run ios:open
```

Then in Xcode:

1. Select the `App` project and `App` target.
2. Under **Signing & Capabilities**, select your Apple developer team.
3. Set a bundle identifier you control; it must match `appId` in `capacitor.config.ts`.
4. Set marketing version and build number.
5. Select a simulator or connected iPhone and press **Run**.
6. Test on a Dynamic Island device and a home-indicator device.
7. For release, select **Any iOS Device (arm64)** and choose **Product → Archive**.
8. Validate and distribute from Xcode Organizer.

Repeat `npm run mobile:sync` before every native release archive.

## 7. Android Studio: run and create an AAB

```bash
npm run android:open
```

Then in Android Studio:

1. Allow Gradle and Android SDK synchronization to finish.
2. Confirm the application ID and version in the app Gradle configuration.
3. Select a physical device or current emulator and press **Run**.
4. Test an Android 16 edge-to-edge target and at least one smaller phone.
5. For release, choose **Build → Generate Signed App Bundle or APK**.
6. Select **Android App Bundle**, create or select a protected release keystore, and generate the release AAB.
7. Upload the AAB to a closed Play testing track before production.

The manifest already declares Internet access, and the Capacitor Share/FileProvider configuration is generated during sync.

## 8. Device QA

- Navigation and notices clear the notch/Dynamic Island.
- Spirit Box composer and audio control clear the home indicator.
- Opening/dismissing the keyboard never covers the composer or permanently shrinks the layout.
- Each haptic action works on real iOS and Android hardware.
- Canvas stays sharp and does not accelerate after pointer movement or view changes.
- Reduced Motion disables expensive decorative motion.
- Card zero can be placed in every spread slot.
- Returning from Oracle preserves forged images, exegesis, and patina.
- Archive export opens the native share sheet and produces a readable HTML file.
- Offline notices appear and failed API calls leave loading states.
- Test a release build with the deployed HTTPS API, not only Vite preview.

## 9. Release decisions still owned by you

- Replace `com.grimoire.app` with your registered bundle/application identifier.
- Deploy and monitor the server and set its production URL.
- Configure Apple/Google signing, icons, launch art, privacy disclosures, and store metadata.
- Decide whether the best-effort Web Speech microphone button is sufficient. Cross-platform native speech recognition requires a maintained speech plugin plus microphone/speech permission declarations.
- Review model content settings and all Eros levels against Gemini policy and the App Store/Play content rules for the markets and age rating you choose.
- For very large 78-card archives, consider server/object storage and thumbnail caching to reduce WebView memory pressure.

