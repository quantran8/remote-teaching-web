<template>
  <div id="student-controls">
    <div class="student-controls__button">
      <span>
        Sticker all
      </span>
    </div>

    <div class="student-controls__button" @click="onClickToggleAudio">
      {{globalAudioText}}
    </div>

    <div class="student-controls__button" @click="onClickToggleVideo">
      {{globalVideoText}}
    </div>
  </div>
</template>

<style lang="scss" scoped src="./student-controls.scss"></style>
<script lang="ts" src="./student-controls.ts"></script>