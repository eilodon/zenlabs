#!/bin/bash
# UniFFI Binding Generation Script
# Generates Swift and Kotlin bindings for ZenOne Rust core

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_OUT="$SCRIPT_DIR/../app/ios/ZenOneCore"
ANDROID_OUT="$SCRIPT_DIR/../app/android/app/src/main/java/com/zenone/core"

echo "🔧 Building Rust library..."
cargo build --release

# Determine library path based on OS
if [[ "$(uname)" == "Darwin" ]]; then
    LIB_PATH="target/release/libzenone.dylib"
elif [[ "$(uname)" == "Linux" ]]; then
    LIB_PATH="target/release/libzenone.so"
else
    echo "❌ Unsupported OS"
    exit 1
fi

if [[ ! -f "$LIB_PATH" ]]; then
    echo "❌ Library not found: $LIB_PATH"
    exit 1
fi

echo "📱 Generating Swift bindings..."
mkdir -p "$IOS_OUT"
uniffi-bindgen generate zenone.udl --language swift --out-dir "$IOS_OUT" || \
    cargo run --features uniffi/cli --bin uniffi-bindgen generate zenone.udl --language swift --out-dir "$IOS_OUT"

echo "🤖 Generating Kotlin bindings..."
mkdir -p "$ANDROID_OUT"
uniffi-bindgen generate zenone.udl --language kotlin --out-dir "$ANDROID_OUT" || \
    cargo run --features uniffi/cli --bin uniffi-bindgen generate zenone.udl --language kotlin --out-dir "$ANDROID_OUT"

echo ""
echo "✅ Bindings generated!"
echo "   Swift:  $IOS_OUT"
echo "   Kotlin: $ANDROID_OUT"
