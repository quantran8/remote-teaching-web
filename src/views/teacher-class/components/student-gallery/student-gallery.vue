<template>
  <StudentOne v-if="oneAndOneStatus" />
  <div class="student-gallery" v-else>
    <StudentControls
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
