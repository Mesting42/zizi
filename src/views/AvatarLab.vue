<template>
  <main class="avatar-lab">
    <header class="avatar-lab-header">
      <router-link to="/" class="avatar-lab-back">BACK TO PORTFOLIO</router-link>
      <p>3D AVATAR STUDY</p>
    </header>

    <section class="avatar-lab-layout">
      <div class="avatar-lab-copy">
        <p class="avatar-lab-kicker">REFERENCE-MATCHED 3D RECONSTRUCTION</p>
        <h1>The original portrait,<br>rebuilt in 3D.</h1>
        <p class="avatar-lab-description">
          The reconstruction keeps the black fringe, side-looking eyes, tense mouth, and sweatshirt silhouette
          from the supplied reference. Move the pointer around the portrait and the head follows naturally.
        </p>

        <dl class="avatar-lab-notes">
          <div>
            <dt>01</dt>
            <dd>Reference-matched face, hair, and clothing texture</dd>
          </div>
          <div>
            <dt>02</dt>
            <dd>Side-eye expression preserved in the generated mesh</dd>
          </div>
          <div>
            <dt>03</dt>
            <dd>Returns naturally when the pointer leaves</dd>
          </div>
        </dl>
      </div>

      <div class="avatar-lab-stage">
        <AvatarMouseFollow
          model-url="/models/avatar/mesting-rodin-rebuild-optimized.glb"
          :max-yaw="14"
          :max-pitch="7"
        />
        <p class="avatar-lab-hint">MOVE YOUR POINTER AROUND THE PORTRAIT</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import AvatarMouseFollow from '../components/AvatarMouseFollow.vue'
</script>

<style scoped>
.avatar-lab {
  min-height: 100svh;
  overflow: hidden;
  color: #f4f2ec;
  background:
    radial-gradient(circle at 77% 38%, rgba(92, 112, 138, 0.22), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(92, 63, 47, 0.15), transparent 36%),
    #090a0c;
}

.avatar-lab::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.055;
  pointer-events: none;
  content: '';
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
}

.avatar-lab-header {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1440px, calc(100% - 80px));
  margin: 0 auto;
  padding: 28px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-lab-header p,
.avatar-lab-back {
  margin: 0;
  color: rgba(255, 255, 255, 0.54);
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-decoration: none;
}

.avatar-lab-back {
  color: rgba(255, 255, 255, 0.82);
}

.avatar-lab-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(320px, 0.82fr) minmax(520px, 1.18fr);
  gap: clamp(30px, 5vw, 90px);
  align-items: center;
  width: min(1440px, calc(100% - 80px));
  min-height: calc(100svh - 92px);
  margin: 0 auto;
  padding: 40px 0 56px;
}

.avatar-lab-copy {
  max-width: 600px;
}

.avatar-lab-kicker {
  margin: 0 0 24px;
  color: #a8bfd9;
  font-size: 0.7rem;
  letter-spacing: 0.24em;
}

.avatar-lab-copy h1 {
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 5.5rem);
  font-weight: 400;
  line-height: 1.03;
  letter-spacing: -0.055em;
}

.avatar-lab-description {
  max-width: 520px;
  margin: 32px 0 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: clamp(0.9rem, 1.1vw, 1.06rem);
  line-height: 1.9;
}

.avatar-lab-notes {
  display: grid;
  gap: 0;
  margin: 46px 0 0;
}

.avatar-lab-notes div {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 16px;
  padding: 13px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
}

.avatar-lab-notes dt,
.avatar-lab-notes dd {
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

.avatar-lab-notes dt {
  color: rgba(168, 191, 217, 0.66);
}

.avatar-lab-stage {
  position: relative;
  height: min(76svh, 840px);
  min-height: 560px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  background:
    radial-gradient(circle at 50% 36%, rgba(255, 255, 255, 0.055), transparent 42%),
    rgba(255, 255, 255, 0.018);
  box-shadow: 0 36px 100px rgba(0, 0, 0, 0.36);
}

.avatar-lab-stage::after {
  position: absolute;
  inset: auto 8% 8% 8%;
  height: 16%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.28);
  filter: blur(36px);
  pointer-events: none;
  content: '';
}

.avatar-lab-hint {
  position: absolute;
  right: 22px;
  bottom: 18px;
  z-index: 4;
  margin: 0;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.55rem;
  letter-spacing: 0.16em;
  pointer-events: none;
}

@media (max-width: 900px) {
  .avatar-lab {
    overflow: visible;
  }

  .avatar-lab-header,
  .avatar-lab-layout {
    width: min(100% - 36px, 680px);
  }

  .avatar-lab-layout {
    grid-template-columns: 1fr;
    padding-top: 58px;
  }

  .avatar-lab-stage {
    height: 64svh;
    min-height: 480px;
  }
}

@media (max-width: 560px) {
  .avatar-lab-header {
    padding: 20px 0;
  }

  .avatar-lab-header p {
    display: none;
  }

  .avatar-lab-layout {
    min-height: 0;
    padding-top: 42px;
  }

  .avatar-lab-copy h1 {
    font-size: 2.7rem;
  }

  .avatar-lab-description {
    margin-top: 22px;
  }

  .avatar-lab-notes {
    margin-top: 34px;
  }

  .avatar-lab-stage {
    height: 58svh;
    min-height: 410px;
  }

  .avatar-lab-hint {
    display: none;
  }
}
</style>
