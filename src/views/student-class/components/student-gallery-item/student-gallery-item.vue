<template>
  <div
    :class="[
      'sc-gallery-item',
      isCurrent && 'sc-gallery-item--large',
      isAudioHightlight && 'sc-gallery-item--speaking',
      isOneToOne && 'sc-gallery-item--xlarge',
    ]"
  >
    <div :class="student.videoEnabled ? 'sc-gallery-item__video sc-gallery-item__visible' : 'sc-gallery-item__not-visible'" :id="student.id"></div>
    <img :class="!student.videoEnabled ? 'sc-gallery-item__img sc-gallery-item__visible' : 'sc-gallery-item__not-visible'" src="@/assets/student-class/no-avatar.png" />
    <h3 class="sc-gallery-item__title">{{ student.name }}</h3>
    <span class="sc-gallery-item__star" v-if="isCurrent">
      <span class="sc-gallery-item__star__content">{{ student.badge }}</span>
    </span>
  </div>
</template>
<script lang="ts" src="./student-gallery-item.ts"></script>
<style lang="scss" scoped src="./student-gallery-item.scss"></style>
