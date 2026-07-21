package com.mesting.music;

import android.Manifest;
import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Paint;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.graphics.SweepGradient;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Base64;
import android.view.Display;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.webkit.WebView;
import android.webkit.JavascriptInterface;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;

import androidx.activity.OnBackPressedCallback;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class MainActivity extends BridgeActivity {
    private static final long MINIMUM_SPLASH_DURATION_MS = 460L;
    private static final long MAXIMUM_SPLASH_DURATION_MS = 7000L;
    private static final int NOTIFICATION_PERMISSION_REQUEST = 4102;

    private final Handler splashHandler = new Handler(Looper.getMainLooper());
    private View startupSplash;
    private AnimatorSet startupAnimator;
    private long splashShownAt;
    private boolean splashDismissRequested;
    private WindowManager lyricsWindowManager;
    private WindowManager.LayoutParams lyricsOverlayParams;
    private View lyricsOverlay;
    private LinearLayout lyricsOverlayHeader;
    private LinearLayout lyricsOverlayControls;
    private LinearLayout lyricsOverlaySettings;
    private LinearLayout lyricsOverlayColorRow;
    private TextView lyricsOverlayTitle;
    private TextView lyricsOverlayCurrent;
    private TextView lyricsOverlayNext;
    private TextView lyricsOverlayPlayPause;
    private TextView lyricsOverlayLock;
    private TextView lyricsOverlaySettingsPreview;
    private TextView lyricsOverlaySettingsSizeValue;
    private TextView lyricsOverlayCustomColorValue;
    private TextView lyricsOverlayBrightnessValue;
    private TextView lyricsOverlayColorSwatch;
    private LyricsColorWheel lyricsOverlayColorWheel;
    private SeekBar lyricsOverlayBrightnessSlider;
    private boolean pendingLyricsOverlayPermission;
    private int lyricsOverlayTextColor = Color.WHITE;
    private float lyricsOverlayTextSizeSp = 22f;
    private boolean lyricsOverlayLocked;
    private boolean lyricsOverlayExpanded;
    private boolean lyricsOverlaySettingsVisible;
    private boolean lyricsOverlayPlaying;
    private String renderedOverlayCurrent = "";
    private String renderedOverlayNext = "";
    private float nativeSafeTopCss;
    private float nativeSafeBottomCss;
    private String pendingOverlayCurrent = "暂无同步歌词";
    private String pendingOverlayNext = "";
    private String pendingOverlayTitle = "正在播放";
    private BroadcastReceiver mediaControlReceiver;
    private boolean nativeWebReady;
    private boolean notificationPermissionRequested;
    private String pendingMediaAction;

    private static final int[] LYRICS_OVERLAY_COLORS = {
        0xFFFFFFFF,
        0xFFFFD45C,
        0xFFFF7FA0,
        0xFF70E2FF,
        0xFF8CFFB5,
        0xFFC9A7FF,
        0xFFFF9B72,
        0xFF8FB5FF
    };

    private final Runnable forceDismissSplash = () -> requestSplashDismissal(true);

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        pendingMediaAction = getIntent() == null
            ? null
            : getIntent().getStringExtra(MusicNotificationService.EXTRA_LAUNCH_ACTION);

        showStartupSplash();

        WebView webView = getBridge().getWebView();
        // Music screens are designed as a fixed app canvas. Disable WebView's
        // browser-style pinch / double-tap scaling so the UI cannot be left
        // in a zoomed and unusable state.
        webView.getSettings().setSupportZoom(false);
        webView.getSettings().setBuiltInZoomControls(false);
        webView.getSettings().setDisplayZoomControls(false);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setBackgroundColor(Color.parseColor("#160B20"));
        webView.addJavascriptInterface(new StartupSplashBridge(), "MestingNativeSplash");
        webView.addJavascriptInterface(new NativeNavigationBridge(), "MestingNativeNavigation");
        webView.addJavascriptInterface(new LyricsOverlayBridge(), "MestingLyricsOverlay");
        webView.addJavascriptInterface(new MediaNotificationBridge(), "MestingMediaNotification");
        registerMediaControlReceiver();
        exposeSystemBarInsets(webView);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                webView.evaluateJavascript(
                    "window.dispatchEvent(new CustomEvent('mesting:native-back'));",
                    null
                );
            }
        });

        requestHighestSupportedRefreshRate();
    }

    private void exposeSystemBarInsets(WebView webView) {
        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            Insets statusBars = windowInsets.getInsets(WindowInsetsCompat.Type.statusBars());
            Insets navigationBars = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars());
            float density = getResources().getDisplayMetrics().density;
            nativeSafeTopCss = statusBars.top / density;
            nativeSafeBottomCss = navigationBars.bottom / density;

            webView.post(() -> applySystemBarCssVariables(webView));
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }

    private void applySystemBarCssVariables(WebView webView) {
        webView.evaluateJavascript(
            "document.documentElement.style.setProperty('--native-safe-top','"
                + nativeSafeTopCss
                + "px');document.documentElement.style.setProperty('--native-safe-bottom','"
                + nativeSafeBottomCss
                + "px');",
            null
        );
    }

    private void showStartupSplash() {
        ViewGroup content = findViewById(android.R.id.content);
        startupSplash = LayoutInflater.from(this).inflate(R.layout.view_startup_splash, content, false);
        content.addView(
            startupSplash,
            new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        );

        splashShownAt = System.currentTimeMillis();
        startSplashAnimation();
        splashHandler.postDelayed(forceDismissSplash, MAXIMUM_SPLASH_DURATION_MS);
    }

    private void startSplashAnimation() {
        if (startupSplash == null) return;

        View logoStage = startupSplash.findViewById(R.id.startup_logo_stage);
        View loadingIndicator = startupSplash.findViewById(R.id.startup_loading_indicator);

        logoStage.setAlpha(0f);
        logoStage.setScaleX(0.96f);
        logoStage.setScaleY(0.96f);
        logoStage.animate()
            .alpha(1f)
            .scaleX(1f)
            .scaleY(1f)
            .setDuration(180L)
            .start();

        ObjectAnimator loadingPulse = ObjectAnimator.ofFloat(
            loadingIndicator,
            View.ALPHA,
            0.35f,
            0.9f,
            0.35f
        );
        loadingPulse.setDuration(1300L);
        loadingPulse.setRepeatCount(ObjectAnimator.INFINITE);

        startupAnimator = new AnimatorSet();
        startupAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
        startupAnimator.playTogether(loadingPulse);
        startupAnimator.start();
    }

    private void requestSplashDismissal(boolean force) {
        if (startupSplash == null || splashDismissRequested) return;

        long elapsed = System.currentTimeMillis() - splashShownAt;
        if (!force && elapsed < MINIMUM_SPLASH_DURATION_MS) {
            splashHandler.postDelayed(
                () -> requestSplashDismissal(false),
                MINIMUM_SPLASH_DURATION_MS - elapsed
            );
            return;
        }

        splashDismissRequested = true;
        splashHandler.removeCallbacks(forceDismissSplash);

        if (startupAnimator != null) {
            startupAnimator.cancel();
        }

        startupSplash.animate()
            .alpha(0f)
            .setDuration(280L)
            .setListener(new Animator.AnimatorListener() {
                @Override
                public void onAnimationStart(Animator animation) {}

                @Override
                public void onAnimationEnd(Animator animation) {
                    ViewGroup parent = (ViewGroup) startupSplash.getParent();
                    if (parent != null) {
                        parent.removeView(startupSplash);
                    }
                    startupSplash = null;
                }

                @Override
                public void onAnimationCancel(Animator animation) {}

                @Override
                public void onAnimationRepeat(Animator animation) {}
            })
            .start();
    }

    private class StartupSplashBridge {
        @JavascriptInterface
        public void ready() {
            runOnUiThread(() -> {
                nativeWebReady = true;
                applySystemBarCssVariables(getBridge().getWebView());
                requestSplashDismissal(false);
                dispatchPendingMediaAction();
            });
        }
    }

    private class NativeNavigationBridge {
        @JavascriptInterface
        public void exitApp() {
            // Root-level back gestures should behave like pressing Home: keep
            // the WebView and playback state alive, then resume that exact
            // activity when the launcher icon is tapped again.
            runOnUiThread(() -> moveTaskToBack(true));
        }
    }

    private class LyricsOverlayBridge {
        @JavascriptInterface
        public void show() {
            runOnUiThread(MainActivity.this::showLyricsOverlay);
        }

        @JavascriptInterface
        public void hide() {
            runOnUiThread(() -> hideLyricsOverlay(false));
        }

        @JavascriptInterface
        public void update(String currentLine, String nextLine, String songLabel) {
            runOnUiThread(() -> updateLyricsOverlay(currentLine, nextLine, songLabel));
        }

        @JavascriptInterface
        public void configure(String color, float textSize, boolean locked) {
            runOnUiThread(() -> configureLyricsOverlay(color, textSize, locked));
        }
    }

    private class MediaNotificationBridge {
        @JavascriptInterface
        public void update(String stateJson) {
            updateMediaNotification(stateJson);
        }

        @JavascriptInterface
        public void stop() {
            runOnUiThread(() -> stopService(
                new Intent(MainActivity.this, MusicNotificationService.class)
                    .setAction(MusicNotificationService.ACTION_STOP)
            ));
        }
    }

    private void registerMediaControlReceiver() {
        mediaControlReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null) return;
                handleMediaControl(
                    intent.getStringExtra(MusicNotificationService.EXTRA_CONTROL_ACTION),
                    intent.getLongExtra(MusicNotificationService.EXTRA_POSITION_MS, -1L)
                );
            }
        };

        IntentFilter filter = new IntentFilter(MusicNotificationService.ACTION_MEDIA_CONTROL);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mediaControlReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(mediaControlReceiver, filter);
        }
    }

    private void updateMediaNotification(String stateJson) {
        try {
            JSONObject state = new JSONObject(stateJson == null ? "{}" : stateJson);
            boolean playing = state.optBoolean("playing", false);
            String trackKey = state.optString("trackKey", "");
            String coverPath = persistNotificationArtwork(
                state.optString("coverData", ""),
                trackKey
            );

            Intent updateIntent = new Intent(this, MusicNotificationService.class)
                .setAction(MusicNotificationService.ACTION_UPDATE)
                .putExtra(MusicNotificationService.EXTRA_TITLE, state.optString("title", "正在播放"))
                .putExtra(MusicNotificationService.EXTRA_ARTIST, state.optString("artist", "Mesting 音乐"))
                .putExtra(MusicNotificationService.EXTRA_TRACK_KEY, trackKey)
                .putExtra(MusicNotificationService.EXTRA_PLAYING, playing)
                .putExtra(MusicNotificationService.EXTRA_LIKED, state.optBoolean("liked", false))
                .putExtra(MusicNotificationService.EXTRA_POSITION_MS, state.optLong("positionMs", 0L))
                .putExtra(MusicNotificationService.EXTRA_DURATION_MS, state.optLong("durationMs", 0L));

            if (!coverPath.isEmpty()) {
                updateIntent.putExtra(MusicNotificationService.EXTRA_COVER_PATH, coverPath);
            }

            runOnUiThread(() -> {
                updateLyricsOverlayPlaybackState(playing);
                requestNotificationPermissionIfNeeded(playing);
                ContextCompat.startForegroundService(MainActivity.this, updateIntent);
            });
        } catch (Exception ignored) {
            // Invalid state should never interrupt the web player.
        }
    }

    private String persistNotificationArtwork(String coverData, String trackKey) {
        if (coverData == null || coverData.isEmpty()) return "";
        int separator = coverData.indexOf(',');
        String encoded = separator >= 0 ? coverData.substring(separator + 1) : coverData;
        if (encoded.isEmpty()) return "";

        try {
            byte[] imageBytes = Base64.decode(encoded, Base64.DEFAULT);
            if (imageBytes.length == 0) return "";

            String safeKey = Integer.toHexString((trackKey == null ? "" : trackKey).hashCode());
            File artworkFile = new File(getCacheDir(), "media-cover-" + safeKey + ".jpg");
            try (FileOutputStream output = new FileOutputStream(artworkFile, false)) {
                output.write(imageBytes);
                output.flush();
            }
            return artworkFile.getAbsolutePath();
        } catch (IllegalArgumentException | IOException ignored) {
            return "";
        }
    }

    private void requestNotificationPermissionIfNeeded(boolean playing) {
        if (
            !playing
                || Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
                || notificationPermissionRequested
                || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    == PackageManager.PERMISSION_GRANTED
        ) {
            return;
        }

        notificationPermissionRequested = true;
        ActivityCompat.requestPermissions(
            this,
            new String[] { Manifest.permission.POST_NOTIFICATIONS },
            NOTIFICATION_PERMISSION_REQUEST
        );
    }

    private void dispatchMediaControlToWeb(String action, long positionMs) {
        if (action == null || action.trim().isEmpty()) return;
        if (!nativeWebReady || getBridge() == null || getBridge().getWebView() == null) {
            pendingMediaAction = action;
            return;
        }

        String script =
            "window.dispatchEvent(new CustomEvent('mesting:native-media-control',{detail:{action:"
                + JSONObject.quote(action)
                + ",positionMs:"
                + positionMs
                + "}}));";
        getBridge().getWebView().evaluateJavascript(script, null);
    }

    private void handleMediaControl(String action, long positionMs) {
        if (action == null || action.trim().isEmpty()) return;
        if ("open_lyrics".equals(action)) {
            runOnUiThread(() -> {
                if (lyricsOverlayLocked) {
                    unlockLyricsOverlayFromNotification();
                } else {
                    showLyricsOverlay();
                }
            });
        }
        dispatchMediaControlToWeb(action, positionMs);
    }

    private void dispatchPendingMediaAction() {
        if (pendingMediaAction == null || pendingMediaAction.trim().isEmpty()) return;
        String action = pendingMediaAction;
        pendingMediaAction = null;
        handleMediaControl(action, -1L);
    }

    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void requestLyricsOverlayPermission() {
        pendingLyricsOverlayPermission = true;
        Intent intent = new Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:" + getPackageName())
        );
        startActivity(intent);
    }

    private void showLyricsOverlay() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            requestLyricsOverlayPermission();
            return;
        }

        pendingLyricsOverlayPermission = false;
        if (lyricsOverlay != null) return;

        lyricsWindowManager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);

        LinearLayout lyricsLayer = new LinearLayout(this);
        lyricsLayer.setOrientation(LinearLayout.VERTICAL);
        lyricsLayer.setGravity(Gravity.CENTER);
        lyricsLayer.setPadding(dp(8), dp(6), dp(8), dp(6));
        lyricsLayer.setBackgroundColor(Color.TRANSPARENT);
        lyricsLayer.setClickable(true);
        lyricsLayer.setClipToPadding(false);

        lyricsOverlayHeader = new LinearLayout(this);
        lyricsOverlayHeader.setOrientation(LinearLayout.HORIZONTAL);
        lyricsOverlayHeader.setGravity(Gravity.CENTER_VERTICAL);
        lyricsOverlayHeader.setPadding(dp(2), 0, 0, dp(4));
        lyricsOverlayHeader.setVisibility(View.GONE);

        lyricsOverlayTitle = new TextView(this);
        lyricsOverlayTitle.setText("♫  正在播放");
        lyricsOverlayTitle.setSingleLine(true);
        lyricsOverlayTitle.setTextColor(Color.argb(205, 219, 226, 255));
        lyricsOverlayTitle.setTextSize(12f);
        lyricsOverlayTitle.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        lyricsOverlayTitle.setGravity(Gravity.CENTER_VERTICAL);
        lyricsOverlayHeader.addView(lyricsOverlayTitle, new LinearLayout.LayoutParams(
            0,
            dp(38),
            1f
        ));

        TextView closeButton = createLyricsOverlayControl("×", "关闭桌面歌词", false);
        closeButton.setTextSize(28f);
        closeButton.setOnClickListener(view -> hideLyricsOverlay(true));
        lyricsOverlayHeader.addView(closeButton, new LinearLayout.LayoutParams(dp(44), dp(38)));
        lyricsLayer.addView(lyricsOverlayHeader, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        lyricsOverlayCurrent = new TextView(this);
        lyricsOverlayCurrent.setText("暂无同步歌词");
        lyricsOverlayCurrent.setGravity(Gravity.CENTER);
        lyricsOverlayCurrent.setMaxLines(2);
        lyricsOverlayCurrent.setPadding(dp(4), dp(3), dp(4), dp(2));
        lyricsLayer.addView(lyricsOverlayCurrent, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        lyricsOverlayControls = new LinearLayout(this);
        lyricsOverlayControls.setOrientation(LinearLayout.HORIZONTAL);
        lyricsOverlayControls.setGravity(Gravity.CENTER);
        lyricsOverlayControls.setPadding(0, dp(10), 0, 0);
        lyricsOverlayControls.setVisibility(View.GONE);

        lyricsOverlayLock = createLyricsOverlayControl("锁", "锁定桌面歌词", false);
        lyricsOverlayLock.setOnClickListener(view -> lockLyricsOverlayFromDesktop());
        lyricsOverlayControls.addView(lyricsOverlayLock, weightedOverlayControlParams());

        TextView previousButton = createLyricsOverlayControl("◀", "上一首", false);
        previousButton.setOnClickListener(view -> handleMediaControl("previous", -1L));
        lyricsOverlayControls.addView(previousButton, weightedOverlayControlParams());

        lyricsOverlayPlayPause = createLyricsOverlayControl("▶", "播放", true);
        lyricsOverlayPlayPause.setOnClickListener(view -> toggleLyricsOverlayPlayback());
        lyricsOverlayControls.addView(
            lyricsOverlayPlayPause,
            new LinearLayout.LayoutParams(dp(54), dp(54))
        );

        TextView nextButton = createLyricsOverlayControl("▶", "下一首", false);
        nextButton.setOnClickListener(view -> handleMediaControl("next", -1L));
        lyricsOverlayControls.addView(nextButton, weightedOverlayControlParams());

        TextView settingsButton = createLyricsOverlayControl("⚙", "桌面歌词设置", false);
        settingsButton.setTextSize(24f);
        settingsButton.setOnClickListener(view -> openNativeLyricsSettings());
        lyricsOverlayControls.addView(settingsButton, weightedOverlayControlParams());

        lyricsOverlayNext = new TextView(this);
        lyricsOverlayNext.setGravity(Gravity.CENTER);
        lyricsOverlayNext.setMaxLines(1);
        lyricsOverlayNext.setPadding(dp(4), dp(2), dp(4), dp(2));
        lyricsLayer.addView(lyricsOverlayNext, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        lyricsLayer.addView(lyricsOverlayControls, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        lyricsOverlaySettings = createLyricsOverlaySettingsPanel();
        lyricsOverlaySettings.setVisibility(View.GONE);
        lyricsLayer.addView(lyricsOverlaySettings, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        int windowType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            : WindowManager.LayoutParams.TYPE_PHONE;
        int baseFlags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
            | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
            | WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH
            | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
            | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN;
        if (lyricsOverlayLocked) {
            baseFlags |= WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
        }

        lyricsOverlayParams = new WindowManager.LayoutParams(
            Math.min(dp(420), getResources().getDisplayMetrics().widthPixels - dp(24)),
            ViewGroup.LayoutParams.WRAP_CONTENT,
            windowType,
            baseFlags,
            PixelFormat.TRANSLUCENT
        );
        lyricsOverlayParams.gravity = Gravity.TOP | Gravity.START;
        lyricsOverlayParams.x = Math.max(
            dp(12),
            (getResources().getDisplayMetrics().widthPixels - lyricsOverlayParams.width) / 2
        );
        lyricsOverlayParams.y = dp(132);

        bindLyricsOverlayDrag(lyricsLayer);

        try {
            lyricsWindowManager.addView(lyricsLayer, lyricsOverlayParams);
            lyricsOverlay = lyricsLayer;
            lyricsOverlayExpanded = false;
            applyLyricsOverlayAppearance();
            updateLyricsOverlayPlaybackState(lyricsOverlayPlaying);
            updateLyricsOverlay(
                pendingOverlayCurrent,
                pendingOverlayNext,
                pendingOverlayTitle
            );
        } catch (SecurityException ignored) {
            requestLyricsOverlayPermission();
        }
    }

    private void bindLyricsOverlayDrag(View dragHandle) {
        final int touchSlop = ViewConfiguration.get(this).getScaledTouchSlop();
        dragHandle.setOnTouchListener(new View.OnTouchListener() {
            private float downRawX;
            private float downRawY;
            private int downWindowX;
            private int downWindowY;
            private boolean dragging;

            @Override
            public boolean onTouch(View view, MotionEvent event) {
                if (
                    lyricsOverlayLocked
                    || lyricsOverlayParams == null
                    || lyricsWindowManager == null
                    || lyricsOverlay == null
                ) {
                    return false;
                }

                switch (event.getActionMasked()) {
                    case MotionEvent.ACTION_OUTSIDE:
                        // Keep the lyric line visible, but collapse the expanded
                        // control/settings card when the user taps elsewhere on
                        // the desktop. FLAG_NOT_TOUCH_MODAL lets that same tap
                        // continue to the app or launcher underneath.
                        if (lyricsOverlayExpanded || lyricsOverlaySettingsVisible) {
                            setLyricsOverlayExpanded(false);
                        }
                        return true;
                    case MotionEvent.ACTION_DOWN:
                        downRawX = event.getRawX();
                        downRawY = event.getRawY();
                        downWindowX = lyricsOverlayParams.x;
                        downWindowY = lyricsOverlayParams.y;
                        dragging = false;
                        lyricsOverlay.animate().cancel();
                        lyricsOverlay.animate().alpha(0.9f).setDuration(90L).start();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        float deltaX = event.getRawX() - downRawX;
                        float deltaY = event.getRawY() - downRawY;
                        if (!dragging && Math.hypot(deltaX, deltaY) < touchSlop) {
                            return true;
                        }
                        dragging = true;

                        int maxX = Math.max(
                            0,
                            getResources().getDisplayMetrics().widthPixels - lyricsOverlayParams.width
                        );
                        int maxY = Math.max(
                            0,
                            getResources().getDisplayMetrics().heightPixels
                                - Math.max(lyricsOverlay.getHeight(), dp(72))
                        );
                        int nextX = Math.max(
                            0,
                            Math.min(maxX, downWindowX + Math.round(deltaX))
                        );
                        int nextY = Math.max(
                            0,
                            Math.min(maxY, downWindowY + Math.round(deltaY))
                        );
                        if (nextX != lyricsOverlayParams.x || nextY != lyricsOverlayParams.y) {
                            lyricsOverlayParams.x = nextX;
                            lyricsOverlayParams.y = nextY;
                            try {
                                lyricsWindowManager.updateViewLayout(lyricsOverlay, lyricsOverlayParams);
                            } catch (IllegalArgumentException ignored) {
                                return false;
                            }
                        }
                        return true;
                    case MotionEvent.ACTION_UP:
                        lyricsOverlay.animate().alpha(1f).setDuration(140L).start();
                        if (!dragging) view.performClick();
                        return true;
                    case MotionEvent.ACTION_CANCEL:
                        lyricsOverlay.animate().alpha(1f).setDuration(140L).start();
                        return true;
                    default:
                        return false;
                }
            }
        });
        dragHandle.setOnClickListener(view -> {
            setLyricsOverlayExpanded(!lyricsOverlayExpanded);
        });
    }

    private LinearLayout.LayoutParams weightedOverlayControlParams() {
        return new LinearLayout.LayoutParams(0, dp(50), 1f);
    }

    private TextView createLyricsOverlayControl(
        String symbol,
        String contentDescription,
        boolean primary
    ) {
        TextView button = new TextView(this);
        button.setText(symbol);
        button.setContentDescription(contentDescription);
        button.setGravity(Gravity.CENTER);
        button.setTextColor(primary ? Color.WHITE : Color.argb(210, 212, 222, 255));
        button.setTextSize(primary ? 26f : 21f);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setClickable(true);
        button.setFocusable(true);
        button.setPadding(dp(4), 0, dp(4), 0);

        if (primary) {
            GradientDrawable background = new GradientDrawable();
            background.setShape(GradientDrawable.OVAL);
            background.setColor(Color.argb(52, 255, 255, 255));
            background.setStroke(dp(2), Color.argb(190, 219, 226, 255));
            button.setBackground(background);
        }
        return button;
    }

    private GradientDrawable createRoundedOverlayBackground(
        int fillColor,
        float radiusDp,
        int strokeColor
    ) {
        GradientDrawable background = new GradientDrawable();
        background.setColor(fillColor);
        background.setCornerRadius(dp(radiusDp));
        if (Color.alpha(strokeColor) > 0) {
            background.setStroke(dp(1), strokeColor);
        }
        return background;
    }

    private TextView createOverlaySettingsButton(String text, String description) {
        TextView button = new TextView(this);
        button.setText(text);
        button.setContentDescription(description);
        button.setGravity(Gravity.CENTER);
        button.setTextColor(Color.argb(232, 231, 237, 255));
        button.setTextSize(12f);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setClickable(true);
        button.setFocusable(true);
        button.setPadding(dp(12), 0, dp(12), 0);
        button.setBackground(createRoundedOverlayBackground(
            Color.argb(34, 255, 255, 255),
            12,
            Color.argb(40, 186, 202, 255)
        ));
        return button;
    }

    private interface OnLyricsColorChangedListener {
        void onColorChanged(float hue, float saturation);
    }

    /**
     * Compact HSV colour wheel for the desktop-lyrics overlay. The angle picks
     * hue and the distance from the centre picks saturation, so users can see
     * the result before choosing rather than hunting across a single hue bar.
     */
    private final class LyricsColorWheel extends View {
        private static final int[] HUE_COLORS = {
            Color.RED,
            Color.YELLOW,
            Color.GREEN,
            Color.CYAN,
            Color.BLUE,
            Color.MAGENTA,
            Color.RED
        };

        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private float hue;
        private float saturation;
        private boolean trackingColor;
        private OnLyricsColorChangedListener listener;

        LyricsColorWheel(Context context) {
            super(context);
            setClickable(true);
            setFocusable(true);
        }

        void setOnColorChangedListener(OnLyricsColorChangedListener listener) {
            this.listener = listener;
        }

        void setColor(int color) {
            float[] hsv = new float[3];
            Color.colorToHSV(color, hsv);
            hue = hsv[0];
            saturation = hsv[1];
            trackingColor = false;
            invalidate();
        }

        private float clamp(float value, float min, float max) {
            return Math.max(min, Math.min(max, value));
        }

        /**
         * A finger naturally covers the exact point being picked. While
         * dragging, show an offset colour loupe so the selected hue remains
         * visible without asking the user to lift their finger.
         */
        private void drawColorLoupe(Canvas canvas, float markerX, float markerY) {
            if (!trackingColor) return;

            float loupeRadius = dp(14);
            float edge = loupeRadius + dp(2);
            float offsetX = markerX <= getWidth() / 2f ? dp(29) : -dp(29);
            float offsetY = markerY <= getHeight() / 2f ? dp(29) : -dp(29);
            float loupeX = clamp(markerX + offsetX, edge, getWidth() - edge);
            float loupeY = clamp(markerY + offsetY, edge, getHeight() - edge);

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(206, 10, 17, 41));
            canvas.drawCircle(loupeX, loupeY, loupeRadius + dp(3), paint);
            paint.setColor(Color.HSVToColor(new float[] { hue, saturation, 1f }));
            canvas.drawCircle(loupeX, loupeY, loupeRadius, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(2));
            paint.setColor(Color.WHITE);
            canvas.drawCircle(loupeX, loupeY, loupeRadius, paint);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float side = Math.min(getWidth(), getHeight());
            float inset = dp(5);
            float radius = Math.max(0f, side / 2f - inset);
            float centerX = getWidth() / 2f;
            float centerY = getHeight() / 2f;
            if (radius <= 0f) return;

            paint.setStyle(Paint.Style.FILL);
            paint.setShader(new SweepGradient(centerX, centerY, HUE_COLORS, null));
            canvas.drawCircle(centerX, centerY, radius, paint);

            paint.setShader(new RadialGradient(
                centerX,
                centerY,
                radius,
                new int[] { Color.WHITE, Color.TRANSPARENT },
                new float[] { 0f, 0.84f },
                Shader.TileMode.CLAMP
            ));
            canvas.drawCircle(centerX, centerY, radius, paint);
            paint.setShader(null);

            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(1.2f));
            paint.setColor(Color.argb(155, 255, 255, 255));
            canvas.drawCircle(centerX, centerY, radius, paint);

            double radians = Math.toRadians(hue);
            float markerX = centerX + (float) Math.cos(radians) * saturation * radius;
            float markerY = centerY + (float) Math.sin(radians) * saturation * radius;
            float markerRadius = dp(6);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(175, 0, 0, 0));
            canvas.drawCircle(markerX, markerY, markerRadius + dp(1.5f), paint);
            paint.setColor(Color.HSVToColor(new float[] { hue, saturation, 1f }));
            canvas.drawCircle(markerX, markerY, markerRadius, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(2));
            paint.setColor(Color.WHITE);
            canvas.drawCircle(markerX, markerY, markerRadius, paint);
            drawColorLoupe(canvas, markerX, markerY);
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            float side = Math.min(getWidth(), getHeight());
            float radius = Math.max(0f, side / 2f - dp(5));
            float centerX = getWidth() / 2f;
            float centerY = getHeight() / 2f;
            float deltaX = event.getX() - centerX;
            float deltaY = event.getY() - centerY;

            switch (event.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                case MotionEvent.ACTION_MOVE:
                    if (radius <= 0f) return false;
                    trackingColor = true;
                    float distance = (float) Math.hypot(deltaX, deltaY);
                    saturation = Math.min(1f, distance / radius);
                    hue = (float) Math.toDegrees(Math.atan2(deltaY, deltaX));
                    if (hue < 0f) hue += 360f;
                    invalidate();
                    if (listener != null) listener.onColorChanged(hue, saturation);
                    return true;
                case MotionEvent.ACTION_UP:
                    performClick();
                    trackingColor = false;
                    invalidate();
                    return true;
                case MotionEvent.ACTION_CANCEL:
                    trackingColor = false;
                    invalidate();
                    return true;
                default:
                    return super.onTouchEvent(event);
            }
        }

        @Override
        public boolean performClick() {
            super.performClick();
            return true;
        }
    }

    private LinearLayout createLyricsOverlaySettingsPanel() {
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setPadding(dp(12), dp(12), dp(12), dp(12));
        panel.setBackground(createRoundedOverlayBackground(
            Color.argb(160, 25, 31, 61),
            16,
            Color.argb(58, 160, 180, 255)
        ));

        LinearLayout heading = new LinearLayout(this);
        heading.setOrientation(LinearLayout.HORIZONTAL);
        heading.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout headingCopy = new LinearLayout(this);
        headingCopy.setOrientation(LinearLayout.VERTICAL);
        TextView headingTitle = new TextView(this);
        headingTitle.setText("歌词样式");
        headingTitle.setTextColor(Color.WHITE);
        headingTitle.setTextSize(16f);
        headingTitle.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        TextView headingHint = new TextView(this);
        headingHint.setText("在桌面直接调整 · 即时生效");
        headingHint.setTextColor(Color.argb(150, 211, 220, 247));
        headingHint.setTextSize(10f);
        headingCopy.addView(headingTitle);
        headingCopy.addView(headingHint);
        heading.addView(headingCopy, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView doneButton = createOverlaySettingsButton("完成", "收起歌词设置");
        doneButton.setOnClickListener(view -> setLyricsOverlaySettingsVisible(false));
        heading.addView(doneButton, new LinearLayout.LayoutParams(dp(64), dp(36)));
        panel.addView(heading, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        lyricsOverlaySettingsPreview = new TextView(this);
        lyricsOverlaySettingsPreview.setText(pendingOverlayCurrent);
        lyricsOverlaySettingsPreview.setGravity(Gravity.CENTER);
        lyricsOverlaySettingsPreview.setMaxLines(2);
        lyricsOverlaySettingsPreview.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        lyricsOverlaySettingsPreview.setPadding(dp(10), dp(12), dp(10), dp(12));
        lyricsOverlaySettingsPreview.setBackground(createRoundedOverlayBackground(
            Color.argb(92, 2, 6, 20),
            14,
            Color.argb(38, 185, 202, 255)
        ));
        LinearLayout.LayoutParams previewParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        previewParams.setMargins(0, dp(12), 0, dp(12));
        panel.addView(lyricsOverlaySettingsPreview, previewParams);

        LinearLayout sizeHeading = new LinearLayout(this);
        sizeHeading.setOrientation(LinearLayout.HORIZONTAL);
        sizeHeading.setGravity(Gravity.CENTER_VERTICAL);
        TextView sizeLabel = new TextView(this);
        sizeLabel.setText("字体大小");
        sizeLabel.setTextColor(Color.argb(230, 238, 241, 255));
        sizeLabel.setTextSize(13f);
        lyricsOverlaySettingsSizeValue = new TextView(this);
        lyricsOverlaySettingsSizeValue.setGravity(Gravity.END | Gravity.CENTER_VERTICAL);
        lyricsOverlaySettingsSizeValue.setTextColor(Color.rgb(255, 135, 170));
        lyricsOverlaySettingsSizeValue.setTextSize(12f);
        lyricsOverlaySettingsSizeValue.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        sizeHeading.addView(sizeLabel, new LinearLayout.LayoutParams(0, dp(28), 1f));
        sizeHeading.addView(lyricsOverlaySettingsSizeValue, new LinearLayout.LayoutParams(dp(56), dp(28)));
        panel.addView(sizeHeading);

        SeekBar sizeSlider = new SeekBar(this);
        sizeSlider.setMax(20);
        sizeSlider.setProgress(Math.round(lyricsOverlayTextSizeSp) - 16);
        sizeSlider.setProgressTintList(ColorStateList.valueOf(Color.rgb(255, 102, 138)));
        sizeSlider.setThumbTintList(ColorStateList.valueOf(Color.rgb(255, 137, 168)));
        sizeSlider.setContentDescription("桌面歌词字体大小");
        sizeSlider.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (!fromUser) return;
                lyricsOverlayTextSizeSp = 16f + progress;
                applyLyricsOverlayAppearance();
                notifyLyricsOverlayAppearanceChanged();
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        panel.addView(sizeSlider, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dp(38)
        ));

        TextView colorLabel = new TextView(this);
        colorLabel.setText("字体颜色");
        colorLabel.setTextColor(Color.argb(230, 238, 241, 255));
        colorLabel.setTextSize(13f);
        colorLabel.setPadding(0, dp(6), 0, dp(8));
        panel.addView(colorLabel);

        lyricsOverlayColorRow = new LinearLayout(this);
        lyricsOverlayColorRow.setOrientation(LinearLayout.HORIZONTAL);
        lyricsOverlayColorRow.setGravity(Gravity.CENTER);
        for (int color : LYRICS_OVERLAY_COLORS) {
            TextView colorButton = new TextView(this);
            colorButton.setTag(color);
            colorButton.setContentDescription(String.format("使用颜色 #%06X", 0xFFFFFF & color));
            colorButton.setClickable(true);
            colorButton.setFocusable(true);
            colorButton.setOnClickListener(view -> {
                lyricsOverlayTextColor = (int) view.getTag();
                syncOverlayColorPicker();
                applyLyricsOverlayAppearance();
                notifyLyricsOverlayAppearanceChanged();
            });
            LinearLayout.LayoutParams colorParams = new LinearLayout.LayoutParams(dp(34), dp(34));
            colorParams.setMargins(dp(3), 0, dp(3), 0);
            lyricsOverlayColorRow.addView(colorButton, colorParams);
        }
        panel.addView(lyricsOverlayColorRow, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dp(40)
        ));

        LinearLayout customColorCard = new LinearLayout(this);
        customColorCard.setOrientation(LinearLayout.VERTICAL);
        customColorCard.setPadding(dp(10), dp(8), dp(10), dp(8));
        customColorCard.setBackground(createRoundedOverlayBackground(
            Color.argb(30, 255, 255, 255),
            14,
            Color.argb(44, 185, 202, 255)
        ));
        LinearLayout.LayoutParams customColorCardParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        customColorCardParams.setMargins(0, dp(3), 0, 0);

        LinearLayout customHeading = new LinearLayout(this);
        customHeading.setOrientation(LinearLayout.HORIZONTAL);
        customHeading.setGravity(Gravity.CENTER_VERTICAL);
        TextView customLabel = new TextView(this);
        customLabel.setText("自定义色彩");
        customLabel.setTextColor(Color.argb(230, 240, 244, 255));
        customLabel.setTextSize(12f);
        customLabel.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        lyricsOverlayCustomColorValue = new TextView(this);
        lyricsOverlayCustomColorValue.setGravity(Gravity.END | Gravity.CENTER_VERTICAL);
        lyricsOverlayCustomColorValue.setTextSize(11f);
        lyricsOverlayCustomColorValue.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        lyricsOverlayColorSwatch = new TextView(this);
        lyricsOverlayColorSwatch.setContentDescription("当前自定义歌词颜色");
        customHeading.addView(customLabel, new LinearLayout.LayoutParams(0, dp(28), 1f));
        customHeading.addView(lyricsOverlayCustomColorValue, new LinearLayout.LayoutParams(dp(76), dp(28)));
        LinearLayout.LayoutParams swatchParams = new LinearLayout.LayoutParams(dp(22), dp(22));
        swatchParams.setMargins(dp(7), 0, 0, 0);
        customHeading.addView(lyricsOverlayColorSwatch, swatchParams);
        customColorCard.addView(customHeading);

        LinearLayout colorPickerRow = new LinearLayout(this);
        colorPickerRow.setOrientation(LinearLayout.HORIZONTAL);
        colorPickerRow.setGravity(Gravity.CENTER_VERTICAL);
        lyricsOverlayColorWheel = new LyricsColorWheel(this);
        lyricsOverlayColorWheel.setContentDescription("色盘，拖动选择歌词颜色");
        lyricsOverlayColorWheel.setOnColorChangedListener((hue, saturation) -> {
            float[] hsv = new float[3];
            Color.colorToHSV(lyricsOverlayTextColor, hsv);
            lyricsOverlayTextColor = Color.HSVToColor(new float[] {
                hue,
                saturation,
                Math.max(0.18f, hsv[2])
            });
            applyLyricsOverlayAppearance();
            notifyLyricsOverlayAppearanceChanged();
        });
        colorPickerRow.addView(lyricsOverlayColorWheel, new LinearLayout.LayoutParams(dp(94), dp(94)));

        LinearLayout pickerCopy = new LinearLayout(this);
        pickerCopy.setOrientation(LinearLayout.VERTICAL);
        pickerCopy.setGravity(Gravity.CENTER_VERTICAL);
        pickerCopy.setPadding(dp(10), 0, 0, 0);
        TextView pickerTitle = new TextView(this);
        pickerTitle.setText("色盘取色");
        pickerTitle.setTextColor(Color.WHITE);
        pickerTitle.setTextSize(12f);
        pickerTitle.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        TextView pickerHint = new TextView(this);
        pickerHint.setText("拖动取色，颜色预览会避开手指显示");
        pickerHint.setTextColor(Color.argb(158, 211, 220, 247));
        pickerHint.setTextSize(10f);
        pickerHint.setPadding(0, dp(2), 0, dp(5));
        LinearLayout brightnessHeading = new LinearLayout(this);
        brightnessHeading.setOrientation(LinearLayout.HORIZONTAL);
        brightnessHeading.setGravity(Gravity.CENTER_VERTICAL);
        TextView brightnessLabel = new TextView(this);
        brightnessLabel.setText("明度");
        brightnessLabel.setTextColor(Color.argb(210, 230, 235, 255));
        brightnessLabel.setTextSize(11f);
        lyricsOverlayBrightnessValue = new TextView(this);
        lyricsOverlayBrightnessValue.setGravity(Gravity.END | Gravity.CENTER_VERTICAL);
        lyricsOverlayBrightnessValue.setTextColor(Color.argb(206, 235, 241, 255));
        lyricsOverlayBrightnessValue.setTextSize(10f);
        brightnessHeading.addView(brightnessLabel, new LinearLayout.LayoutParams(0, dp(20), 1f));
        brightnessHeading.addView(lyricsOverlayBrightnessValue, new LinearLayout.LayoutParams(dp(42), dp(20)));
        lyricsOverlayBrightnessSlider = new SeekBar(this);
        lyricsOverlayBrightnessSlider.setMax(100);
        lyricsOverlayBrightnessSlider.setContentDescription("歌词颜色明度");
        lyricsOverlayBrightnessSlider.setThumbTintList(ColorStateList.valueOf(Color.WHITE));
        lyricsOverlayBrightnessSlider.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (!fromUser) return;
                float[] hsv = new float[3];
                Color.colorToHSV(lyricsOverlayTextColor, hsv);
                hsv[2] = Math.max(0.18f, progress / 100f);
                lyricsOverlayTextColor = Color.HSVToColor(hsv);
                applyLyricsOverlayAppearance();
                notifyLyricsOverlayAppearanceChanged();
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        pickerCopy.addView(pickerTitle);
        pickerCopy.addView(pickerHint);
        pickerCopy.addView(brightnessHeading);
        pickerCopy.addView(lyricsOverlayBrightnessSlider, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dp(30)
        ));
        colorPickerRow.addView(pickerCopy, new LinearLayout.LayoutParams(
            0,
            ViewGroup.LayoutParams.MATCH_PARENT,
            1f
        ));
        customColorCard.addView(colorPickerRow, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dp(94)
        ));
        panel.addView(customColorCard, customColorCardParams);

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setGravity(Gravity.CENTER);
        actions.setPadding(0, dp(10), 0, 0);
        TextView resetButton = createOverlaySettingsButton("恢复默认", "恢复默认歌词样式");
        resetButton.setOnClickListener(view -> {
            lyricsOverlayTextColor = Color.WHITE;
            lyricsOverlayTextSizeSp = 22f;
            syncOverlayColorPicker();
            applyLyricsOverlayAppearance();
            notifyLyricsOverlayAppearanceChanged();
        });
        LinearLayout.LayoutParams resetParams = new LinearLayout.LayoutParams(0, dp(40), 1f);
        resetParams.setMargins(0, 0, dp(5), 0);
        actions.addView(resetButton, resetParams);

        TextView lockButton = createOverlaySettingsButton("锁定歌词", "锁定桌面歌词并允许点击穿透");
        lockButton.setTextColor(Color.rgb(255, 207, 105));
        lockButton.setOnClickListener(view -> lockLyricsOverlayFromDesktop());
        LinearLayout.LayoutParams lockParams = new LinearLayout.LayoutParams(0, dp(40), 1f);
        lockParams.setMargins(dp(5), 0, 0, 0);
        actions.addView(lockButton, lockParams);
        panel.addView(actions, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        syncOverlayColorPicker();
        return panel;
    }

    private void setLyricsOverlayExpanded(boolean expanded) {
        if (!expanded) {
            lyricsOverlaySettingsVisible = false;
        }
        lyricsOverlayExpanded = expanded;
        if (lyricsOverlayHeader != null) {
            lyricsOverlayHeader.setVisibility(expanded ? View.VISIBLE : View.GONE);
        }
        if (lyricsOverlayControls != null) {
            lyricsOverlayControls.setVisibility(
                expanded && !lyricsOverlaySettingsVisible ? View.VISIBLE : View.GONE
            );
        }
        if (lyricsOverlayCurrent != null) {
            lyricsOverlayCurrent.setVisibility(
                lyricsOverlaySettingsVisible ? View.GONE : View.VISIBLE
            );
        }
        if (lyricsOverlayNext != null) {
            lyricsOverlayNext.setVisibility(
                !lyricsOverlaySettingsVisible && !pendingOverlayNext.isEmpty()
                    ? View.VISIBLE
                    : View.GONE
            );
        }
        if (lyricsOverlaySettings != null) {
            lyricsOverlaySettings.setVisibility(
                expanded && lyricsOverlaySettingsVisible ? View.VISIBLE : View.GONE
            );
        }

        if (lyricsOverlay instanceof LinearLayout) {
            LinearLayout layer = (LinearLayout) lyricsOverlay;
            if (expanded) {
                layer.setPadding(dp(14), dp(8), dp(14), dp(12));
                GradientDrawable panel = new GradientDrawable();
                panel.setColor(Color.argb(226, 11, 18, 48));
                panel.setCornerRadius(dp(18));
                panel.setStroke(dp(1), Color.argb(92, 160, 180, 255));
                layer.setBackground(panel);
                layer.setElevation(dp(10));
            } else {
                layer.setPadding(dp(8), dp(6), dp(8), dp(6));
                layer.setBackgroundColor(Color.TRANSPARENT);
                layer.setElevation(0f);
            }
        }

        if (lyricsOverlayParams == null || lyricsWindowManager == null || lyricsOverlay == null) {
            return;
        }

        int screenWidth = getResources().getDisplayMetrics().widthPixels;
        int previousWidth = lyricsOverlayParams.width;
        int centerX = lyricsOverlayParams.x + previousWidth / 2;
        int horizontalMargin = dp(expanded ? 8 : 12);
        int preferredWidth = dp(expanded ? 520 : 420);
        lyricsOverlayParams.width = Math.min(preferredWidth, screenWidth - horizontalMargin * 2);
        lyricsOverlayParams.x = Math.max(
            horizontalMargin,
            Math.min(
                screenWidth - horizontalMargin - lyricsOverlayParams.width,
                centerX - lyricsOverlayParams.width / 2
            )
        );

        try {
            lyricsWindowManager.updateViewLayout(lyricsOverlay, lyricsOverlayParams);
        } catch (IllegalArgumentException ignored) {
            // The overlay may be between detach and cleanup.
        }
    }

    private void setLyricsOverlaySettingsVisible(boolean visible) {
        lyricsOverlaySettingsVisible = visible;
        if (!lyricsOverlayExpanded) {
            setLyricsOverlayExpanded(true);
            return;
        }

        setLyricsOverlayExpanded(true);
        if (visible) {
            syncOverlayColorPicker();
            applyLyricsOverlayAppearance();
        }
    }

    private void syncOverlayColorPicker() {
        float[] hsv = new float[3];
        Color.colorToHSV(lyricsOverlayTextColor, hsv);
        if (lyricsOverlayColorWheel != null) {
            lyricsOverlayColorWheel.setColor(lyricsOverlayTextColor);
        }
        if (lyricsOverlayBrightnessSlider != null) {
            lyricsOverlayBrightnessSlider.setProgress(Math.round(hsv[2] * 100f));
            lyricsOverlayBrightnessSlider.setProgressTintList(
                ColorStateList.valueOf(lyricsOverlayTextColor)
            );
        }
    }

    private void updateLyricsOverlayPlaybackState(boolean playing) {
        lyricsOverlayPlaying = playing;
        if (lyricsOverlayPlayPause == null) return;
        lyricsOverlayPlayPause.setText(playing ? "Ⅱ" : "▶");
        lyricsOverlayPlayPause.setContentDescription(playing ? "暂停" : "播放");
    }

    private void toggleLyricsOverlayPlayback() {
        boolean shouldPlay = !lyricsOverlayPlaying;
        updateLyricsOverlayPlaybackState(shouldPlay);
        handleMediaControl(shouldPlay ? "play" : "pause", -1L);
    }

    private void lockLyricsOverlayFromDesktop() {
        setLyricsOverlayExpanded(false);
        lyricsOverlayLocked = true;
        applyLyricsOverlayAppearance();
        notifyLyricsOverlayLockChanged(true);
        notifyLyricsOverlayAppearanceChanged();
    }

    private void unlockLyricsOverlayFromNotification() {
        lyricsOverlayLocked = false;
        setLyricsOverlayExpanded(false);
        applyLyricsOverlayAppearance();
        notifyLyricsOverlayLockChanged(false);
        notifyLyricsOverlayAppearanceChanged();

        // A saved "locked" preference can outlive the floating window. In that
        // case the same notification tap both unlocks the preference and shows
        // the lyrics again.
        if (lyricsOverlay == null) {
            showLyricsOverlay();
        }
    }

    private void notifyLyricsOverlayLockChanged(boolean locked) {
        if (!nativeWebReady || getBridge() == null || getBridge().getWebView() == null) return;
        getBridge().getWebView().evaluateJavascript(
            "window.dispatchEvent(new CustomEvent('mesting:lyrics-overlay-lock-changed',"
                + "{detail:{locked:" + locked + "}}));",
            null
        );
    }

    private void notifyLyricsOverlayAppearanceChanged() {
        if (!nativeWebReady || getBridge() == null || getBridge().getWebView() == null) return;
        String color = String.format("#%06X", 0xFFFFFF & lyricsOverlayTextColor);
        getBridge().getWebView().evaluateJavascript(
            "window.dispatchEvent(new CustomEvent('mesting:lyrics-overlay-appearance-changed',"
                + "{detail:{color:'" + color + "',size:" + Math.round(lyricsOverlayTextSizeSp)
                + ",locked:" + lyricsOverlayLocked + "}}));",
            null
        );
    }

    private void openNativeLyricsSettings() {
        setLyricsOverlaySettingsVisible(true);
    }

    private void updateLyricsOverlay(String currentLine, String nextLine, String songLabel) {
        String current = currentLine == null || currentLine.trim().isEmpty()
            ? "暂无同步歌词"
            : currentLine.trim();
        String next = nextLine == null ? "" : nextLine.trim();
        String label = songLabel == null || songLabel.trim().isEmpty()
            ? "正在播放"
            : songLabel.trim();

        pendingOverlayCurrent = current;
        pendingOverlayNext = next;
        pendingOverlayTitle = label;

        if (lyricsOverlayCurrent == null) return;

        if (lyricsOverlayTitle != null) {
            lyricsOverlayTitle.setText("♫  " + label);
        }

        if (!current.equals(renderedOverlayCurrent)) {
            renderedOverlayCurrent = current;
            lyricsOverlayCurrent.animate().cancel();
            lyricsOverlayCurrent.setText(current);
            lyricsOverlayCurrent.setAlpha(0f);
            lyricsOverlayCurrent.setTranslationY(dp(8));
            lyricsOverlayCurrent.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(220L)
                .start();
        }

        if (lyricsOverlaySettingsPreview != null) {
            lyricsOverlaySettingsPreview.setText(current);
        }

        if (!next.equals(renderedOverlayNext)) {
            renderedOverlayNext = next;
            lyricsOverlayNext.animate().cancel();
            lyricsOverlayNext.setText(next);
            lyricsOverlayNext.setVisibility(
                next.isEmpty() || lyricsOverlaySettingsVisible ? View.GONE : View.VISIBLE
            );
            if (!next.isEmpty()) {
                lyricsOverlayNext.setAlpha(0f);
                lyricsOverlayNext.setTranslationY(dp(5));
                lyricsOverlayNext.animate()
                    .alpha(0.72f)
                    .translationY(0f)
                    .setDuration(240L)
                    .start();
            }
        }
    }

    private void configureLyricsOverlay(String color, float textSize, boolean locked) {
        try {
            lyricsOverlayTextColor = Color.parseColor(color);
        } catch (IllegalArgumentException ignored) {
            lyricsOverlayTextColor = Color.WHITE;
        }
        lyricsOverlayTextSizeSp = Math.max(16f, Math.min(36f, textSize));
        if (locked && !lyricsOverlayLocked) {
            setLyricsOverlayExpanded(false);
        }
        lyricsOverlayLocked = locked;
        syncOverlayColorPicker();
        applyLyricsOverlayAppearance();
    }

    private void applyLyricsOverlayAppearance() {
        if (lyricsOverlayCurrent != null) {
            lyricsOverlayCurrent.setTextColor(lyricsOverlayTextColor);
            lyricsOverlayCurrent.setTextSize(lyricsOverlayTextSizeSp);
            lyricsOverlayCurrent.setShadowLayer(dp(2.2f), 0f, dp(1f), Color.argb(230, 0, 0, 0));
        }
        if (lyricsOverlayNext != null) {
            lyricsOverlayNext.setTextColor(Color.argb(
                176,
                Color.red(lyricsOverlayTextColor),
                Color.green(lyricsOverlayTextColor),
                Color.blue(lyricsOverlayTextColor)
            ));
            lyricsOverlayNext.setTextSize(Math.max(14f, lyricsOverlayTextSizeSp * 0.72f));
            lyricsOverlayNext.setShadowLayer(dp(1.8f), 0f, dp(1f), Color.argb(220, 0, 0, 0));
        }
        if (lyricsOverlayLock != null) {
            lyricsOverlayLock.setText(lyricsOverlayLocked ? "已锁" : "锁");
            lyricsOverlayLock.setContentDescription(
                lyricsOverlayLocked ? "桌面歌词已锁定" : "锁定桌面歌词"
            );
        }
        if (lyricsOverlaySettingsPreview != null) {
            lyricsOverlaySettingsPreview.setTextColor(lyricsOverlayTextColor);
            lyricsOverlaySettingsPreview.setTextSize(lyricsOverlayTextSizeSp);
            lyricsOverlaySettingsPreview.setShadowLayer(
                dp(2f),
                0f,
                dp(1f),
                Color.argb(220, 0, 0, 0)
            );
        }
        if (lyricsOverlaySettingsSizeValue != null) {
            lyricsOverlaySettingsSizeValue.setText(Math.round(lyricsOverlayTextSizeSp) + "px");
        }
        if (lyricsOverlayCustomColorValue != null) {
            String colorHex = String.format("#%06X", 0xFFFFFF & lyricsOverlayTextColor);
            lyricsOverlayCustomColorValue.setText(colorHex);
            lyricsOverlayCustomColorValue.setTextColor(lyricsOverlayTextColor);
        }
        if (lyricsOverlayBrightnessValue != null) {
            float[] hsv = new float[3];
            Color.colorToHSV(lyricsOverlayTextColor, hsv);
            lyricsOverlayBrightnessValue.setText(Math.round(hsv[2] * 100f) + "%");
        }
        if (lyricsOverlayColorSwatch != null) {
            GradientDrawable swatch = new GradientDrawable();
            swatch.setShape(GradientDrawable.OVAL);
            swatch.setColor(lyricsOverlayTextColor);
            swatch.setStroke(dp(2), Color.argb(198, 255, 255, 255));
            lyricsOverlayColorSwatch.setBackground(swatch);
        }
        if (lyricsOverlayBrightnessSlider != null) {
            lyricsOverlayBrightnessSlider.setProgressTintList(
                ColorStateList.valueOf(lyricsOverlayTextColor)
            );
        }
        if (lyricsOverlayColorRow != null) {
            for (int index = 0; index < lyricsOverlayColorRow.getChildCount(); index++) {
                View child = lyricsOverlayColorRow.getChildAt(index);
                Object tag = child.getTag();
                if (!(tag instanceof Integer)) continue;
                int optionColor = (int) tag;
                boolean selected = (optionColor & 0xFFFFFF) == (lyricsOverlayTextColor & 0xFFFFFF);
                GradientDrawable dot = new GradientDrawable();
                dot.setShape(GradientDrawable.OVAL);
                dot.setColor(optionColor);
                dot.setStroke(
                    dp(selected ? 3 : 1),
                    selected ? Color.WHITE : Color.argb(72, 255, 255, 255)
                );
                child.setBackground(dot);
                child.setElevation(selected ? dp(4) : 0f);
            }
        }

        if (lyricsOverlayParams == null || lyricsWindowManager == null || lyricsOverlay == null) {
            return;
        }

        if (lyricsOverlayLocked) {
            lyricsOverlayParams.flags |= WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
        } else {
            lyricsOverlayParams.flags &= ~WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
        }
        try {
            lyricsWindowManager.updateViewLayout(lyricsOverlay, lyricsOverlayParams);
        } catch (IllegalArgumentException ignored) {
            // The overlay may be between detach and cleanup.
        }
    }

    private void hideLyricsOverlay(boolean notifyWeb) {
        if (lyricsOverlay != null && lyricsWindowManager != null) {
            try {
                lyricsWindowManager.removeView(lyricsOverlay);
            } catch (IllegalArgumentException ignored) {
                // The system may already have detached the overlay.
            }
        }

        lyricsOverlay = null;
        lyricsOverlayParams = null;
        lyricsOverlayHeader = null;
        lyricsOverlayControls = null;
        lyricsOverlaySettings = null;
        lyricsOverlayColorRow = null;
        lyricsOverlayTitle = null;
        lyricsOverlayCurrent = null;
        lyricsOverlayNext = null;
        lyricsOverlayPlayPause = null;
        lyricsOverlayLock = null;
        lyricsOverlaySettingsPreview = null;
        lyricsOverlaySettingsSizeValue = null;
        lyricsOverlayCustomColorValue = null;
        lyricsOverlayBrightnessValue = null;
        lyricsOverlayColorSwatch = null;
        lyricsOverlayColorWheel = null;
        lyricsOverlayBrightnessSlider = null;
        lyricsOverlayExpanded = false;
        lyricsOverlaySettingsVisible = false;
        renderedOverlayCurrent = "";
        renderedOverlayNext = "";

        if (notifyWeb && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('mesting:lyrics-overlay-closed'));",
                null
            );
        }
    }

    /**
     * Prefer the fastest panel mode that keeps the current physical
     * resolution. Android and the device's power policy remain free to select
     * a lower rate, which keeps this safe on 60/90 Hz phones while allowing
     * 120 Hz on Xiaomi, Honor, vivo, OPPO, Samsung and other supported panels.
     */
    private void requestHighestSupportedRefreshRate() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;

        Display display = getWindowManager().getDefaultDisplay();
        Display.Mode currentMode = display.getMode();
        Display.Mode preferredMode = currentMode;

        for (Display.Mode mode : display.getSupportedModes()) {
            boolean sameResolution = mode.getPhysicalWidth() == currentMode.getPhysicalWidth()
                && mode.getPhysicalHeight() == currentMode.getPhysicalHeight();

            if (sameResolution && mode.getRefreshRate() > preferredMode.getRefreshRate()) {
                preferredMode = mode;
            }
        }

        if (preferredMode.getModeId() != currentMode.getModeId()) {
            WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.preferredDisplayModeId = preferredMode.getModeId();
            getWindow().setAttributes(attributes);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (
            pendingLyricsOverlayPermission
                && (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this))
        ) {
            showLyricsOverlay();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent == null) return;

        String action = intent.getStringExtra(MusicNotificationService.EXTRA_LAUNCH_ACTION);
        if (action != null && !action.trim().isEmpty()) {
            pendingMediaAction = action;
            dispatchPendingMediaAction();
            intent.removeExtra(MusicNotificationService.EXTRA_LAUNCH_ACTION);
        }
    }

    @Override
    public void onRequestPermissionsResult(
        int requestCode,
        String[] permissions,
        int[] grantResults
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != NOTIFICATION_PERMISSION_REQUEST) return;

        notificationPermissionRequested = false;
        if (nativeWebReady && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('mesting:native-media-permission-changed'));",
                null
            );
        }
    }

    @Override
    public void onDestroy() {
        splashHandler.removeCallbacksAndMessages(null);
        if (startupAnimator != null) {
            startupAnimator.cancel();
        }
        hideLyricsOverlay(false);
        if (mediaControlReceiver != null) {
            try {
                unregisterReceiver(mediaControlReceiver);
            } catch (IllegalArgumentException ignored) {
                // Receiver was already removed with the activity.
            }
            mediaControlReceiver = null;
        }
        // The media service owns its own lifecycle. Activity recreation or
        // temporarily moving the task into the background must not stop it.
        // Explicit playback stop and actual task removal still stop it.
        super.onDestroy();
    }
}
