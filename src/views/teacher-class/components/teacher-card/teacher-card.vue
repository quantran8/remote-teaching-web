<template>
  <div :class="['tc-video', !isGalleryView && 'tc-video--small']">
    <figure class="tc-video__figure">
      <video v-if="!isUsingAgora && isSupportedVideo" class="tc-video__video" :id="teacher?.id + '__video'" v-show="teacher?.videoEnabled" />
      <canvas v-else-if="!isUsingAgora && !isSupportedVideo" class="tc-video__video" :id="teacher?.id + '__video'" v-show="teacher?.videoEnabled" />
      <div v-else class="tc-video__video" :id="teacher?.id" v-show="teacher?.videoEnabled"></div>
     
	  <div v-if="!teacher?.videoEnabled" class="teacher-avatar-container">
        <img class="teacher-avatar" alt="teacher-avatar" :src="avatarTeacher" />
      </div>
    </figure>
    <div class="tc-action">
      <a href="javascript:void(0)" class="tc-action__item" @click="toggleAudio">
        <img :src="audioIcon" class="tc-action__icon" />
      </a>
      <a href="javascript:void(0)" class="tc-action__item" @click="toggleVideo">
        <img :src="videoIcon" class="tc-action__icon" />
      </a>
      <span v-if="isLowBandWidth" class="tc-action__item">
        <img :src="IconLowWifi" class="tc-action__item--wifi" />
      </span>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher-card.scss"></style>
<script lang="ts" src="./teacher-card.ts"></script>
