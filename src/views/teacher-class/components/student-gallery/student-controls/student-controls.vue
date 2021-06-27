<template>
  <div :class="['student-controls', !isSidebarCollapsed && 'have-sidebar']">
    <div class="button-group">
      <div class="student-controls__button">
        <span @click="onClickStickerAll" class="student-controls__button--clickable">
          <img class="sticker-icon" :src="require(`@/assets/sticker.svg`)" />
          <span>Sticker all</span>
        </span>
      </div>
      <div class="student-controls__button">
        <span @click="onClickToggleAudio" class="student-controls__button--clickable">
          <span>
            <img class="audio-icon" :src="isAllAudioMuted ? require(`@/assets/unmuted.svg`) : require(`@/assets/mute.svg`)" />
            <span>{{ isAllAudioMuted ? "Unmute all" : "Mute all" }}</span>
          </span>
        </span>
      </div>
    </div>
    <div class="button-group">
      <div class="student-controls__button">
        <span @click="onClickDisableAll" class="student-controls__button--clickable">
          <img class="disable-icon" :src="require(`@/assets/teacher-class/touch-off-small.svg`)" />
          <span>Disable all</span>
        </span>
      </div>
      <div class="student-controls__button">
        <span @click="onClickToggleVideo" class="student-controls__button--clickable">
          <span>
            <img class="video-icon" :src="isAllVideoHidden ? require(`@/assets/show-all.svg`) : require(`@/assets/hide-all.svg`)" />
            <span>{{ isAllVideoHidden ? "Show All" : "Hide All" }}</span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped src="./student-controls.scss"></style>
<script lang="ts" src="./student-controls.ts"></script>
