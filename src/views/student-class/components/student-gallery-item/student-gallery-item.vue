<template>
  <div
    :class="[
      'sc-gallery-item',
      isCurrent && 'sc-gallery-item--current',
      isAudioHighlight && 'sc-gallery-item--highlight',
      isOneToOne && 'sc-gallery-item--one-on-one',
      isRaisingHand && 'sc-gallery-item--help',
    ]"
    ref="containerRef"
  >
    <div
      class="sc-gallery-item__video"
      :class="[isSpeaking && 'sc-gallery-item--speaking']"
      v-show="student.videoEnabled && !isNotJoinned"
      :id="student.id"
    ></div>
    <img
      class="sc-gallery-item__img"
      :class="[isSpeaking && 'sc-gallery-item--speaking']"
      v-show="!student.videoEnabled || isNotJoinned"
      src="@/assets/student-class/no-avatar.png"
    />
    <div class="sc-gallery-item__title-container">
      <h3 class="sc-gallery-item__title" :class="isNotJoinned ? 'sc-gallery-item__disable' : 'sc-gallery-item__enable'">{{ student.name }}</h3>
    </div>
    <span class="sc-gallery-item__star" v-if="isCurrent">
      <span class="sc-gallery-item__star__content">{{ student.badge }}</span>
    </span>
  </div>
</template>
<script lang="ts" src="./student-gallery-item.ts"></script>
<style lang="scss" scoped src="./student-gallery-item.scss"></style>
