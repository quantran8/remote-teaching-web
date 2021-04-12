<template>
  <div
    :class="[
      'sc-gallery-item',
      isCurrent && 'sc-gallery-item--current',
      isAudioHighlight && 'sc-gallery-item--speaking', //it's not speaking, should be removed later
      isOneToOne && 'sc-gallery-item--one-on-one',
    ]"
  >
    <div class="sc-gallery-item__video" :class="[isSpeaking && 'user-speaking']" v-show="student.videoEnabled" :id="student.id"></div>
    <img class="sc-gallery-item__img" v-show="!student.videoEnabled" src="@/assets/student-class/no-avatar.png" />
    <h3 class="sc-gallery-item__title">{{ student.name }}</h3>
    <span class="sc-gallery-item__star" v-if="isCurrent">
      <span class="sc-gallery-item__star__content">{{ student.badge }}</span>
    </span>
  </div>
</template>
<script lang="ts" src="./student-gallery-item.ts"></script>
<style lang="scss" scoped src="./student-gallery-item.scss"></style>
