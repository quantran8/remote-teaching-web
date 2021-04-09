<template>
  <div id="student-controls">
    <div class="student-controls__button">
      <span class="student-controls__button--clickable">
        <img class="sticker-icon" :src="require(`@/assets/sticker.svg`)" />
        <span>Sticker all</span>
      </span>
    </div>

    <div class="student-controls__button">
      <span @click="onClickToggleAudio" class="student-controls__button--clickable">
        <span v-if="isAllAudioMuted">
          <img class="audio-icon" :src="require(`@/assets/unmuted.svg`)" />
          <span>Unmute all</span>
        </span>
        <span v-else>
          <img class="audio-icon" :src="require(`@/assets/mute.svg`)" />
          <span>Mute all</span>
        </span>
      </span>
    </div>

    <div class="student-controls__button">
      <span @click="onClickToggleVideo" class="student-controls__button--clickable">
        <span v-if="isAllVideoHidden">
          <img class="video-icon video-icon--open" :src="require(`@/assets/show-all.svg`)" />
          <span>Show All</span>
        </span>
        <span v-else>
          <img class="video-icon" :src="require(`@/assets/hide-all.svg`)" />
          <span>Hide All</span>
        </span>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./student-controls.scss"></style>
<script lang="ts" src="./student-controls.ts"></script>
