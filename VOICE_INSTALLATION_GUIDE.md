# Voice Installation Guide for Polychord v2

## 🎵 Why Am I Hearing English Voices for Other Languages?

Your system currently only has **English voices** installed, which is why all languages fall back to English pronunciation. This is **completely normal** and the app is working correctly with intelligent fallbacks.

## 🔧 Installing Additional Language Voices

### **Windows 10/11:**

1. **Open Settings** → `Time & Language` → `Language`
2. **Add Languages:**
   - Click "Add a language"
   - Search for and add the languages you want (e.g., "Spanish", "French", "German")
3. **Install Speech Packs:**
   - Click on each language → `Options`
   - Under "Speech", click "Download" 
   - Wait for the speech pack to install
4. **Restart your browser** after installation

### **Popular Language Speech Packs:**
- **Spanish (España)**: `es-ES` - Best for European Spanish
- **Spanish (México)**: `es-MX` - Best for Latin American Spanish  
- **French (France)**: `fr-FR` - Standard French
- **German (Deutschland)**: `de-DE` - Standard German
- **Italian (Italia)**: `it-IT` - Standard Italian
- **Portuguese (Brasil)**: `pt-BR` - Brazilian Portuguese
- **Russian (Россия)**: `ru-RU` - Russian

## 🎯 Current Voice Behavior

**✅ What's Working Now:**
- English voices speak all languages with proper language codes
- This helps the TTS engine understand pronunciation context
- All functionality works perfectly

**🔮 What Will Improve After Installing Voices:**
- Native pronunciation for each language
- Authentic accents and intonation
- Better language-specific speech patterns

## 🧪 Testing Voice Installation

After installing new voices:

1. **Restart your browser completely**
2. **Reload the app**
3. **Check the console** - you should see messages like:
   ```
   es: 2 voices available ["Microsoft Helena (es-ES)", "Microsoft Pablo (es-ES)"]
   ```
4. **Test speech** - select a Spanish word and listen

## 🌍 Recommended Voices by Priority

**High Priority** (most commonly used):
- Spanish (España or México)
- French (France) 
- German (Deutschland)

**Medium Priority**:
- Italian (Italia)
- Portuguese (Brasil)
- Russian (Россия)

**Optional**:
- Japanese (日本)
- Korean (한국)
- Chinese (中国)

## ⚡ Quick Test Commands

Open browser console and run:

```javascript
// Test current voice availability
printVoiceReport();

// Test Spanish pronunciation
testLanguageSpeech('es', 'Hola mundo');

// Test all available voices
window.speechSynthesis.getVoices().forEach(v => 
  console.log(`${v.name} (${v.lang})`)
);
```

## 🔄 Alternative Solutions

**If you can't install system voices:**

1. **Use Chrome** - Best voice support
2. **Enable online voices** - Some browsers can use cloud TTS
3. **Accept English fallback** - The app works perfectly with current setup

## 📞 Verification

After installing voices, you should see in console:
```
✅ All 16 languages have native voice support!
🎵 Speaking "Hola mundo" with voice: Microsoft Helena (es-ES)
```

---

**💡 Remember:** The app works perfectly even with English-only voices. Installing additional voices just enhances the pronunciation experience!
