<template>
  <div class="unit-player">
    <video
      class="azuremediaplayer amp-default-skin amp-big-play-centered unit-player__video"
      id="stream-switch-video"
      controls
      preload="metadata"
      tabIndex="0"
      ref="videoRef"
      data-setup="{}"
	  autoplay
    />
  </div>
</template>
<script lang="ts" src="./unit-player.ts"></script>
<style lang="scss" scoped src="./unit-player.scss"></style>
