<template>
  <div :class="['student-controls', !isSidebarCollapsed && 'have-sidebar']">
    <div class="button-group">
      <div class="student-controls__button">
        <span @click="onClickStickerAll" class="student-controls__button--clickable">
          <img class="sticker-icon" :src="require(`@/assets/sticker.svg`)" />
          <span>{{ stickerAllText }}</span>
        </span>
      </div>
      <div class="student-controls__button">
        <span @click="onClickToggleAudio" class="student-controls__button--clickable">
          <span>
            <img class="audio-icon" :src="isAllAudioMuted ? require(`@/assets/unmuted.svg`) : require(`@/assets/mute.svg`)" />
            <span>{{ isAllAudioMuted ? unmuteAllText : muteAllText }}</span>
          </span>
        </span>
      </div>
    </div>
    <div class="button-group">
      <div class="student-controls__button">
        <span @click="onClickToggleVideo" class="student-controls__button--clickable">
          <span>
            <img class="video-icon" :src="isAllVideoHidden ? require(`@/assets/show-all.svg`) : require(`@/assets/hide-all.svg`)" />
            <span>{{ isAllVideoHidden ? showAllText : hideAllText }}</span>
          </span>
        </span>
      </div>
      <div class="student-controls__button">
        <span
          @click="onClickDisableAll"
          class="student-controls__button--clickable"
          :class="{ 'student-controls__button--disable': isAllPaletteHidden }"
        >
          <img
            class="disable-icon"
            :src="isAllPaletteHidden ? require(`@/assets/teacher-class/touch-on-small.svg`) : require(`@/assets/teacher-class/touch-off-small.svg`)"
          />
          <span>{{ disableAllText }}</span>
        </span>
      </div>
    </div>
    <!-- <div class="button-group">
      <div class="student-controls__button">
        <span @click="onClickCaptureAll" class="student-controls__button--clickable">
          <img class="camera-icon" :src="require(`@/assets/images/photo-camera.png`)" />
          <span>{{ captureAllText }}</span>
        </span>
      </div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped src="./student-controls.scss"></style>
<script lang="ts" src="./student-controls.ts"></script>
