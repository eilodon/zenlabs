# ZenOne

A cross-platform breathing & meditation app with camera-based heart rate detection.

## Tech Stack

- **Frontend**: React Native (TypeScript)
- **Core**: Rust (zenb-core, zenb-signals from AGOLOS)
- **FFI**: UniFFI bindings

## Features

- 🧘 11 breathing patterns (4-7-8, box, coherence, etc.)
- 💓 Camera-based rPPG heart rate detection
- 📊 Session tracking & statistics
- 📳 Haptic feedback on phase transitions
- 🎵 Ambient sound per breathing phase

## Project Structure

```
ZenOne-App/
├── app/                 # React Native app
│   ├── src/
│   │   ├── screens/     # Main, Session, History, Settings
│   │   ├── components/  # BreathCircle, Timer, PatternPicker
│   │   ├── hooks/       # useZenOne, useCamera
│   │   └── stores/      # Zustand state
│   ├── ios/
│   └── android/
├── rust-core/           # Rust FFI layer
└── README.md
```

## Development

```bash
# Install dependencies
cd app && npm install

# iOS
npx pod-install && npm run ios

# Android
npm run android
```

## License

MIT
