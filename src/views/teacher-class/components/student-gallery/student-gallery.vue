<template>
  <!-- <StudentOne v-if="oneAndOneStatus" /> -->
  <!-- <div class="student-gallery" v-else> -->
  <div class="student-gallery">
    <div class="tc-one" v-if="oneAndOneStatus">
      <div class="tc-one__right">
        <p class="tc-one__time">{{ timeCount }}</p>
        <div class="tc-one__action" @click="backToClass">
          <img class="tc-one__action__image" src="@/assets/images/exit-1-1.png" />
          <span class="tc-one__action__text">Return</span>
        </div>
      </div>
    </div>
    <StudentControls
      v-else
      @hide-all="onClickHideAll"
      @mute-all="onClickMuteAll"
      @show-all="onClickShowAll"
      @unmute-all="onClickUnmuteAll"
      @add-sticker-all="onClickStickerAll"
    />
    <StudentAll />
  </div>
</template>
<style lang="scss" scoped src="./student-gallery.scss"></style>
<script lang="ts" src="./student-gallery.ts"></script>
