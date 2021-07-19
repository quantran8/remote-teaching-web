<template>
  <div class="sound" @drop="onDrop" @dragover="onDragOver">
    <BaseButton class="icon">
      <BaseIcon name="icon-audio-on"></BaseIcon>
    </BaseButton>
    <div class="content">
      <div class="student-audio" v-for="studentAudio in globalAudios" :key="studentAudio.studentId">
        <BaseTag :tag="studentAudio.tag" />
      </div>
    </div>
    <BaseButton mode="clear" @click="onClickClearAll" v-if="globalAudios.length">
      <BaseIcon class="close" name="icon-close"></BaseIcon>
    </BaseButton>
  </div>
</template>
<style lang="scss" scoped src="./global-audio-bar.scss"></style>
<script lang="ts" src="./global-audio-bar.ts"></script>
