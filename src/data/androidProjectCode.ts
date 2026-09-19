export interface AndroidFile {
  name: string;
  path: string;
  language: 'java' | 'kotlin' | 'xml' | 'groovy' | 'yaml';
  category: 'java' | 'kotlin' | 'config' | 'ci';
  description: string;
  content: string;
}

export const ANDROID_FILES: AndroidFile[] = [
  {
    name: 'PaymentNotificationService.java',
    path: 'app/src/main/java/com/example/paymentannouncer/PaymentNotificationService.java',
    language: 'java',
    category: 'java',
    description: 'Requested Java NotificationListenerService with TextToSpeech engine and Hindi voice announcement: "आपको [राशि] रुपये प्राप्त हुए".',
    content: `package com.example.paymentannouncer;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.speech.tts.TextToSpeech;
import android.os.Bundle;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PaymentNotificationService extends NotificationListenerService implements TextToSpeech.OnInitListener {

    private TextToSpeech tts;
    private boolean isTtsReady = false;

    @Override
    public void onCreate() {
        super.onCreate();
        tts = new TextToSpeech(this, this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            // हिंदी और भारतीय इंग्लिश दोनों के लिए उपयोगी
            tts.setLanguage(new Locale("hi", "IN"));
            isTtsReady = true;
        }
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || sbn.getNotification() == null) return;

        Bundle extras = sbn.getNotification().extras;
        if (extras == null) return;

        String title = extras.getString("android.title", "");
        CharSequence textSeq = extras.getCharSequence("android.text");
        String message = (textSeq != null) ? textSeq.toString() : "";

        String combined = (title + " " + message).toLowerCase();

        // चेक करें कि क्या यह पेमेंट का मैसेज है
        if (combined.contains("received") || combined.contains("credited") || combined.contains("प्राप्त") || combined.contains("रुपये")) {
            
            // अमाउंट निकालने के लिए रेगुलर एक्सप्रेशन (Regex)
            // यह ₹50, Rs. 100, INR 500 जैसी रकम को पकड़ लेता है
            Pattern pattern = Pattern.compile("(?:₹|rs\\\\.?|inr)\\\\s*([0-9,]+(?:\\\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(title + " " + message);

            if (matcher.find()) {
                String amount = matcher.group(1);
                speakPayment("आपको " + amount + " रुपये प्राप्त हुए");
            }
        }
    }

    private void speakPayment(String text) {
        if (isTtsReady && tts != null) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "PaymentAlert");
        }
    }

    @Override
    public void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
`,
  },
  {
    name: 'MainActivity.java',
    path: 'app/src/main/java/com/example/paymentannouncer/MainActivity.java',
    language: 'java',
    category: 'java',
    description: 'Requested Java MainActivity that displays a single "Notification Access ऑन करें" button to open Android Settings.',
    content: `package com.example.paymentannouncer;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Button btnEnable = new Button(this);
        btnEnable.setText("Notification Access ऑन करें");
        setContentView(btnEnable);

        btnEnable.setOnClickListener(v -> {
            // सीधे नोटिफिकेशन एक्सेस सेटिंग स्क्रीन पर ले जाएगा
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            startActivity(intent);
        });
    }
}
`,
  },
  {
    name: 'AboutActivity.java',
    path: 'app/src/main/java/com/example/paymentannouncer/AboutActivity.java',
    language: 'java',
    category: 'java',
    description: 'Requested Java AboutActivity showing app and developer details with action bar back navigation.',
    content: `package com.example.paymentannouncer;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;

public class AboutActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_about);
        
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("About");
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
`,
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    category: 'config',
    description: 'Requested Android Manifest declaring PaymentNotificationService, MainActivity, and AboutActivity.',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.paymentannouncer">

    <!-- Permissions for soundbox reliability -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Payment Announcer"
        android:theme="@style/Theme.AppCompat.Light.DarkActionBar">

        <!-- Notification Listener Service -->
        <service
            android:name=".PaymentNotificationService"
            android:label="Payment Announcer Service"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".AboutActivity"
            android:label="About"
            android:exported="false"
            android:parentActivityName=".MainActivity" />

    </application>
</manifest>
`,
  },
  {
    name: 'activity_about.xml',
    path: 'app/src/main/res/layout/activity_about.xml',
    language: 'xml',
    category: 'config',
    description: 'Layout used by AboutActivity displaying "PAYMENT ANNOUNCER APP", Owner & Developer: "MD IRFAN ALAM", and Version 1.0.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="24dp"
    android:background="#FFFFFF">

    <!-- ऐप का नाम -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="PAYMENT ANNOUNCER APP"
        android:textSize="20sp"
        android:textStyle="bold"
        android:textColor="#333333"
        android:layout_marginBottom="24dp" />

    <!-- ओनर लेबल -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="OWNER &amp; DEVELOPER"
        android:textSize="14sp"
        android:letterSpacing="0.1"
        android:textColor="#666666" />

    <!-- आपका नाम बड़े अक्षरों में -->
    <TextView
        android:id="@+id/tvOwnerName"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="MD IRFAN ALAM"
        android:textSize="26sp"
        android:textStyle="bold"
        android:textColor="#1A73E8"
        android:layout_marginTop="8dp"
        android:letterSpacing="0.05" />

    <!-- वर्जन या सब-टेक्स्ट -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Version 1.0"
        android:textSize="12sp"
        android:textColor="#999999"
        android:layout_marginTop="16dp" />

</LinearLayout>
`,
  },
  {
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    category: 'config',
    description: 'Requested layout featuring "PAYMENT ANNOUNCER APP", Owner & Developer: "MD IRFAN ALAM", and Version 1.0.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="24dp"
    android:background="#FFFFFF">

    <!-- ऐप का नाम -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="PAYMENT ANNOUNCER APP"
        android:textSize="20sp"
        android:textStyle="bold"
        android:textColor="#333333"
        android:layout_marginBottom="24dp" />

    <!-- ओनर लेबल -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="OWNER &amp; DEVELOPER"
        android:textSize="14sp"
        android:letterSpacing="0.1"
        android:textColor="#666666" />

    <!-- आपका नाम बड़े अक्षरों में -->
    <TextView
        android:id="@+id/tvOwnerName"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="MD IRFAN ALAM"
        android:textSize="26sp"
        android:textStyle="bold"
        android:textColor="#1A73E8"
        android:layout_marginTop="8dp"
        android:letterSpacing="0.05" />

    <!-- वर्जन या सब-टेक्स्ट -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Version 1.0"
        android:textSize="12sp"
        android:textColor="#999999"
        android:layout_marginTop="16dp" />

</LinearLayout>
`,
  },
  {
    name: 'build.gradle',
    path: 'app/build.gradle',
    language: 'groovy',
    category: 'config',
    description: 'Standard Android app build.gradle configured for Java and AppCompat.',
    content: `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.example.paymentannouncer'
    compileSdk 34

    defaultConfig {
        applicationId "com.example.paymentannouncer"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'com.google.android.material:material:1.12.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}
`,
  },
  {
    name: 'release-apk.yml',
    path: '.github/workflows/release-apk.yml',
    language: 'yaml',
    category: 'ci',
    description: 'GitHub Actions workflow that compiles assembleDebug, renames to PaymentAnnouncer.apk, and publishes direct APK on GitHub Releases.',
    content: `name: Direct APK Release

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug

      # सीधी .apk फ़ाइल का नाम सेट करना
      - name: Rename APK
        run: |
          mv app/build/outputs/apk/debug/app-debug.apk app/build/outputs/apk/debug/PaymentAnnouncer.apk

      # GitHub Release बनाना (जहाँ डायरेक्ट APK मिलेगी)
      - name: Create Release and Upload Direct APK
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch' || github.ref == 'refs/heads/main'
        with:
          tag_name: v1.0.\${{ github.run_number }}
          name: "Payment Announcer v1.0.\${{ github.run_number }}"
          body: "Direct APK build by MD IRFAN ALAM"
          draft: false
          prerelease: false
          files: app/build/outputs/apk/debug/PaymentAnnouncer.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`,
  },
  {
    name: 'PaymentNotificationService.kt',
    path: 'app/src/main/java/com/example/paymentannouncer/PaymentNotificationService.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Kotlin alternative implementation with enhanced multi-app parsing and chime sound generator.',
    content: `package com.example.paymentannouncer

import android.app.Notification
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class PaymentNotificationService : NotificationListenerService() {

    private val TAG = "PaymentAnnouncerService"
    private lateinit var ttsManager: TtsManager

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Payment Notification Service started")
        ttsManager = TtsManager(applicationContext)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName ?: return
        val extras: Bundle = sbn.notification.extras ?: return

        val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""

        val combinedContent = "$title $text $bigText".trim()
        Log.d(TAG, "Incoming notification from $packageName: $combinedContent")

        // Check for payment cues
        val lower = combinedContent.lowercase()
        if (lower.contains("received") || lower.contains("credited") || lower.contains("प्राप्त") || lower.contains("रुपये")) {
            val pattern = java.util.regex.Pattern.compile("(?:₹|rs\\\\.?|inr)\\\\s*([0-9,]+(?:\\\\.[0-9]{1,2})?)", java.util.regex.Pattern.CASE_INSENSITIVE)
            val matcher = pattern.matcher(combinedContent)
            if (matcher.find()) {
                val amount = matcher.group(1) ?: "0"
                val speechText = "आपको $amount रुपये प्राप्त हुए"
                ttsManager.announcePayment(speechText)
            }
        }
    }

    override fun onDestroy() {
        ttsManager.shutdown()
        super.onDestroy()
    }
}
`,
  },
  {
    name: 'TtsManager.kt',
    path: 'app/src/main/java/com/example/paymentannouncer/TtsManager.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Kotlin TextToSpeech helper with Hindi locale configuration and tone generator.',
    content: `package com.example.paymentannouncer

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

class TtsManager(private val context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false
    private val toneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 100)

    init {
        tts = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.setLanguage(Locale("hi", "IN"))
            tts?.setSpeechRate(0.95f)
            tts?.setPitch(1.0f)

            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()
            tts?.setAudioAttributes(audioAttributes)
            isInitialized = true
        } else {
            Log.e("TtsManager", "TTS initialization failed: $status")
        }
    }

    fun announcePayment(speechText: String) {
        // Dual beep tone before speech
        toneGenerator.startTone(ToneGenerator.TONE_PROP_BEEP2, 200)

        Handler(Looper.getMainLooper()).postDelayed({
            if (isInitialized) {
                tts?.speak(speechText, TextToSpeech.QUEUE_FLUSH, null, "PaymentSoundbox")
            }
        }, 220)
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        toneGenerator.release()
    }
}
`,
  },
];
