<template>
  <div id="student-controls">
    <div class="student-controls__button">
      <span>
        Sticker all
      </span>
    </div>

    <div class="student-controls__button" @click="onClickToggleAudio">
      <span v-if="isAllAudioMuted">Unmute all</span>
      <span v-else>Mute all</span>
    </div>

    <div class="student-controls__button" @click="onClickToggleVideo">
      <span v-if="isAllVideoHidden">Show all</span>
      <span v-else>Hide all</span>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./student-controls.scss"></style>
<script lang="ts" src="./student-controls.ts"></script>