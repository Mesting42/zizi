package com.mesting.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.provider.Settings;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.session.MediaButtonReceiver;

import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

/**
 * Owns Android's system media session and its MediaStyle notification.
 *
 * Audio still comes from the single web player.  Every notification action is
 * sent back to MainActivity, which forwards it to that player, so the website,
 * lyric screen, lock screen and notification shade always control one source.
 */
public class MusicNotificationService extends Service {
    public static final String ACTION_UPDATE = "com.mesting.music.action.UPDATE_MEDIA";
    public static final String ACTION_COMMAND = "com.mesting.music.action.MEDIA_COMMAND";
    public static final String ACTION_STOP = "com.mesting.music.action.STOP_MEDIA_NOTIFICATION";
    public static final String ACTION_MEDIA_CONTROL = "com.mesting.music.MEDIA_CONTROL";

    public static final String EXTRA_CONTROL_ACTION = "control_action";
    public static final String EXTRA_POSITION_MS = "position_ms";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_ARTIST = "artist";
    public static final String EXTRA_TRACK_KEY = "track_key";
    public static final String EXTRA_COVER_PATH = "cover_path";
    public static final String EXTRA_PLAYING = "playing";
    public static final String EXTRA_DURATION_MS = "duration_ms";
    public static final String EXTRA_LIKED = "liked";
    public static final String EXTRA_LAUNCH_ACTION = "mesting_media_action";

    private static final String CHANNEL_ID = "mesting_music_playback";
    private static final int NOTIFICATION_ID = 20260720;

    private MediaSessionCompat mediaSession;
    private NotificationManager notificationManager;
    private boolean foregroundStarted;
    private String title = "正在播放";
    private String artist = "Mesting 音乐";
    private String trackKey = "";
    private String artworkPath = "";
    private Bitmap artwork;
    private boolean playing;
    private boolean liked;
    private long positionMs;
    private long durationMs;

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        createNotificationChannel();

        mediaSession = new MediaSessionCompat(this, "MestingMusic");
        mediaSession.setFlags(
            MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS
                | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
        );
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                handleControl("play", -1L);
            }

            @Override
            public void onPause() {
                handleControl("pause", -1L);
            }

            @Override
            public void onSkipToNext() {
                handleControl("next", -1L);
            }

            @Override
            public void onSkipToPrevious() {
                handleControl("previous", -1L);
            }

            @Override
            public void onSeekTo(long pos) {
                handleControl("seek", Math.max(0L, pos));
            }

            @Override
            public void onStop() {
                handleControl("pause", -1L);
            }

            @Override
            public void onCustomAction(String action, Bundle extras) {
                handleControl(action, -1L);
            }
        });
        mediaSession.setActive(true);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        String action = intent.getAction();
        if (Intent.ACTION_MEDIA_BUTTON.equals(action)) {
            MediaButtonReceiver.handleIntent(mediaSession, intent);
            return START_NOT_STICKY;
        }

        if (ACTION_STOP.equals(action)) {
            stopNotification();
            return START_NOT_STICKY;
        }

        if (ACTION_COMMAND.equals(action)) {
            handleControl(
                intent.getStringExtra(EXTRA_CONTROL_ACTION),
                intent.getLongExtra(EXTRA_POSITION_MS, -1L)
            );
            return START_NOT_STICKY;
        }

        if (ACTION_UPDATE.equals(action)) {
            applyUpdate(intent);
            publishState();
        }

        return START_NOT_STICKY;
    }

    private void applyUpdate(Intent intent) {
        String nextTrackKey = valueOr(intent.getStringExtra(EXTRA_TRACK_KEY), "");
        boolean trackChanged = !nextTrackKey.equals(trackKey);
        trackKey = nextTrackKey;
        title = valueOr(intent.getStringExtra(EXTRA_TITLE), "正在播放");
        artist = valueOr(intent.getStringExtra(EXTRA_ARTIST), "Mesting 音乐");
        playing = intent.getBooleanExtra(EXTRA_PLAYING, false);
        liked = intent.getBooleanExtra(EXTRA_LIKED, false);
        positionMs = Math.max(0L, intent.getLongExtra(EXTRA_POSITION_MS, 0L));
        durationMs = Math.max(0L, intent.getLongExtra(EXTRA_DURATION_MS, 0L));

        if (trackChanged) {
            recycleArtwork();
            artworkPath = "";
        }

        String nextArtworkPath = valueOr(intent.getStringExtra(EXTRA_COVER_PATH), "");
        if (!nextArtworkPath.isEmpty() && !nextArtworkPath.equals(artworkPath)) {
            recycleArtwork();
            artworkPath = nextArtworkPath;
            artwork = BitmapFactory.decodeFile(artworkPath);
        }
    }

    private void publishState() {
        MediaMetadataCompat.Builder metadata = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM_ARTIST, artist)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, durationMs);

        if (artwork != null) {
            metadata
                .putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, artwork)
                .putBitmap(MediaMetadataCompat.METADATA_KEY_DISPLAY_ICON, artwork);
        }
        mediaSession.setMetadata(metadata.build());
        updatePlaybackState();

        Notification notification = buildNotification();
        if (!foregroundStarted) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(
                    NOTIFICATION_ID,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
                );
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
            foregroundStarted = true;
        } else {
            notificationManager.notify(NOTIFICATION_ID, notification);
        }
    }

    private void updatePlaybackState() {
        long actions = PlaybackStateCompat.ACTION_PLAY
            | PlaybackStateCompat.ACTION_PAUSE
            | PlaybackStateCompat.ACTION_PLAY_PAUSE
            | PlaybackStateCompat.ACTION_SKIP_TO_NEXT
            | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS
            | PlaybackStateCompat.ACTION_SEEK_TO
            | PlaybackStateCompat.ACTION_STOP;

        int state = playing
            ? PlaybackStateCompat.STATE_PLAYING
            : PlaybackStateCompat.STATE_PAUSED;
        Bundle playbackExtras = new Bundle();
        playbackExtras.putBoolean(
            "android.media.playback.ALWAYS_RESERVE_SPACE_FOR.ACTION_SKIP_TO_PREVIOUS",
            true
        );
        playbackExtras.putBoolean(
            "android.media.playback.ALWAYS_RESERVE_SPACE_FOR.ACTION_SKIP_TO_NEXT",
            true
        );

        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
            .setActions(actions)
            .setState(state, positionMs, playing ? 1f : 0f)
            .setExtras(playbackExtras)
            .addCustomAction(
                new PlaybackStateCompat.CustomAction.Builder(
                    "toggle_like",
                    liked ? "取消收藏" : "收藏",
                    liked ? R.drawable.ic_media_favorite_filled : R.drawable.ic_media_favorite
                ).build()
            )
            .addCustomAction(
                new PlaybackStateCompat.CustomAction.Builder(
                    "open_lyrics",
                    "歌词",
                    R.drawable.ic_media_lyrics
                ).build()
            );
        mediaSession.setPlaybackState(stateBuilder.build());
    }

    private Notification buildNotification() {
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launchIntent == null) {
            launchIntent = new Intent(this, MainActivity.class);
        }
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            this,
            10,
            launchIntent,
            pendingIntentFlags(PendingIntent.FLAG_UPDATE_CURRENT)
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_music)
            .setContentTitle(title)
            .setContentText(artist)
            .setSubText("Mesting 音乐")
            .setContentIntent(contentIntent)
            .setDeleteIntent(commandPendingIntent("dismiss", 99))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setColor(Color.parseColor("#8E5F78"))
            .setColorized(false)
            .setSilent(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setOngoing(playing)
            .addAction(
                liked ? R.drawable.ic_media_favorite_filled : R.drawable.ic_media_favorite,
                liked ? "取消收藏" : "收藏",
                commandPendingIntent("toggle_like", 20)
            )
            .addAction(
                android.R.drawable.ic_media_previous,
                "上一首",
                commandPendingIntent("previous", 21)
            )
            .addAction(
                playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                playing ? "暂停" : "播放",
                commandPendingIntent(playing ? "pause" : "play", 22)
            )
            .addAction(
                android.R.drawable.ic_media_next,
                "下一首",
                commandPendingIntent("next", 23)
            )
            .addAction(
                R.drawable.ic_media_lyrics,
                "歌词",
                commandPendingIntent("open_lyrics", 24)
            )
            .setStyle(
                new androidx.media.app.NotificationCompat.MediaStyle()
                    .setMediaSession(mediaSession.getSessionToken())
                    .setShowActionsInCompactView(1, 2, 3)
                    .setShowCancelButton(!playing)
                    .setCancelButtonIntent(commandPendingIntent("dismiss", 98))
            );

        if (artwork != null) {
            builder.setLargeIcon(artwork);
        }
        return builder.build();
    }

    private PendingIntent commandPendingIntent(String command, int requestCode) {
        Intent intent = new Intent(this, MusicNotificationService.class)
            .setAction("dismiss".equals(command) ? ACTION_STOP : ACTION_COMMAND)
            .putExtra(EXTRA_CONTROL_ACTION, command);
        return PendingIntent.getService(
            this,
            requestCode,
            intent,
            pendingIntentFlags(PendingIntent.FLAG_UPDATE_CURRENT)
        );
    }

    private int pendingIntentFlags(int baseFlags) {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
            ? baseFlags | PendingIntent.FLAG_IMMUTABLE
            : baseFlags;
    }

    private void handleControl(String action, long requestedPositionMs) {
        if (action == null || action.isEmpty()) return;

        switch (action) {
            case "play":
                playing = true;
                break;
            case "pause":
                playing = false;
                break;
            case "toggle_like":
                liked = !liked;
                break;
            case "seek":
                positionMs = Math.max(0L, requestedPositionMs);
                break;
            case "open_lyrics":
                // With overlay permission, keep the app in the background and
                // ask the existing activity to show the native desktop lyrics.
                // The first tap without permission opens the app so it can run
                // Android's required overlay-permission flow.
                if (
                    Build.VERSION.SDK_INT < Build.VERSION_CODES.M
                        || Settings.canDrawOverlays(this)
                ) {
                    dispatchWebControl(action, requestedPositionMs);
                } else {
                    openLyricsScreen();
                }
                return;
            default:
                break;
        }

        updatePlaybackState();
        if (foregroundStarted) {
            notificationManager.notify(NOTIFICATION_ID, buildNotification());
        }
        dispatchWebControl(action, requestedPositionMs);
    }

    private void dispatchWebControl(String action, long requestedPositionMs) {
        Intent controlIntent = new Intent(ACTION_MEDIA_CONTROL)
            .setPackage(getPackageName())
            .putExtra(EXTRA_CONTROL_ACTION, action)
            .putExtra(EXTRA_POSITION_MS, requestedPositionMs);
        sendBroadcast(controlIntent);
    }

    private void openLyricsScreen() {
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launchIntent == null) {
            launchIntent = new Intent(this, MainActivity.class);
        }
        launchIntent
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra(EXTRA_LAUNCH_ACTION, "open_lyrics");
        startActivity(launchIntent);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "音乐播放",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("显示正在播放的歌曲和播放控制");
        channel.setShowBadge(false);
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        notificationManager.createNotificationChannel(channel);
    }

    private String valueOr(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value.trim();
    }

    private void stopNotification() {
        mediaSession.setActive(false);
        stopForeground(STOP_FOREGROUND_REMOVE);
        foregroundStarted = false;
        stopSelf();
    }

    private void recycleArtwork() {
        if (artwork != null && !artwork.isRecycled()) {
            artwork.recycle();
        }
        artwork = null;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        stopNotification();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        recycleArtwork();
        super.onDestroy();
    }
}
