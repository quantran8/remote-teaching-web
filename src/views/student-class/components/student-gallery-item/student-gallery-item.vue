<template>
  <div class="item-container">
    <div
      :class="[
        'sc-gallery-item',
        isCurrent && 'sc-gallery-item--current',
        isAudioHighlight && 'sc-gallery-item--highlight',
        isRaisingHand && 'sc-gallery-item--help',
        isNotJoinned && 'sc-gallery-item--disabled',
      ]"
      ref="containerRef"
    >
      <div class="sc-gallery-item__container" :class="[student.isPalette && 'sc-gallery-item--palette']">
        <div
          class="sc-gallery-item__video"
          :class="[isSpeaking && 'sc-gallery-item--speaking']"
          v-show="student.videoEnabled && !isNotJoinned"
          :id="student.id"
          :title="student.englishName"
        ></div>
        <img
          class="sc-gallery-item__img"
          :class="[isSpeaking && 'sc-gallery-item--speaking']"
          v-show="!student.videoEnabled || isNotJoinned"
          src="@/assets/student-class/no-avatar.png"
          :alt="student.englishName"
          :title="student.englishName"
        />
        <span class="sc-gallery-item__star" v-if="isCurrent">
          <span class="sc-gallery-item__star__content">{{ student.badge }}</span>
        </span>
      </div>
    </div>
    <h3 :title="student.englishName" class="sc-gallery-item__title" :class="isNotJoinned && 'sc-gallery-item--disabled-tittle'">{{ student.englishName }}</h3>
  </div>
</template>
<script lang="ts" src="./student-gallery-item.ts"></script>
<style lang="scss" scoped src="./student-gallery-item.scss"></style>
