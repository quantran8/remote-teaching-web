<template>
  <div class="unit-player">
    <video
      class="azuremediaplayer amp-default-skin amp-big-play-centered"
      id="stream-switch-video"
      controls
      preload="metadata"
      width="640"
      height="268"
      tabIndex="0"
      ref="videoRef"
      data-setup="{}"
    />
  </div>
</template>
<script lang="ts" src="./unit-player.ts"></script>
<style lang="scss" scoped src="./unit-player.scss"></style>
