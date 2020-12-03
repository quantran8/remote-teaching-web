<template>
  <div class="sound" @drop="onDrop">
    <BaseButton class="icon">
      <BaseIcon name="icon-audio-on"></BaseIcon>
    </BaseButton>
    <div class="content"></div>
    <BaseButton mode="clear">
      <BaseIcon class="close" name="icon-close"></BaseIcon>
    </BaseButton>
  </div>
</template>
<style lang="scss" scoped src="./global-audio-bar.scss"></style>
<script lang="ts" src="./global-audio-bar.ts"></script>