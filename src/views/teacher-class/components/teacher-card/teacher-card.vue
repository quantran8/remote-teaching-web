<template>
  <div :class="['tc-video', !isGalleryView && 'tc-video--small']">
    <figure class="tc-video__figure">
      <div v-if="isUsingAgora" v-show="teacher?.videoEnabled" class="tc-video__video" :id="teacher?.id" />

      <div v-else class="tc-video__video" v-show="teacher?.videoEnabled">
        <video v-if="isSupportedVideo" :id="teacher?.id + '__video'" />
        <canvas v-else :id="teacher?.id + '__video'" />
      </div>

      <div v-if="!teacher?.videoEnabled" class="teacher-avatar-container">
        <img class="teacher-avatar" alt="teacher-avatar" :src="avatarTeacher" />
      </div>
    </figure>
    <div v-if="!currentUserIsHelper" class="tc-action">
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
