<template>
  <div class="item-container" :id="student.id + '__sub-wrapper'">
    <div
      :class="[
        'sc-gallery-item',
        isNotJoinned && 'sc-gallery-item--disabled',
        isCurrent && 'sc-gallery-item--current',
        isCurrent && isRaisingHand && 'sc-gallery-item--help',
      ]"
      ref="containerRef"
    >
      <div class="sc-gallery-item__container" :class="[student.isPalette && 'sc-gallery-item--palette']">
        <div
          v-show="student.videoEnabled && !isNotJoinned"
          :class="['sc-gallery-item__video', isSpeaking && 'sc-gallery-item--speaking']"
          :id="student.id"
          :title="student.englishName"
        >
          <video v-if="isCurrent && !isUsingAgora && isSupportedVideo" :id="student.id + '__video'" :title="student.englishName" />
          <canvas v-if="isCurrent && !isUsingAgora && !isSupportedVideo" :id="student.id + '__video'" :title="student.englishName" />
        </div>

        <img
          v-if="!student.videoEnabled || isNotJoinned"
          :class="['sc-gallery-item__img', isSpeaking && 'sc-gallery-item--speaking', isNotJoinned && 'sc-gallery-item--disabled-avatar']"
          :src="avatarStudent"
          :alt="student.englishName"
          :title="student.englishName"
        />

        <span class="sc-gallery-item__star" v-if="isCurrent">
          <span class="sc-gallery-item__star__content">{{ student.badge }}</span>
        </span>
      </div>
    </div>
    <h3 :title="student.englishName" class="sc-gallery-item__title" :class="isNotJoinned && 'sc-gallery-item--disabled-tittle'">
      {{ student.englishName }}
    </h3>
    <div class="sc-gallery-item__overlay" />
  </div>
</template>
<script lang="ts" src="./student-gallery-item.ts"></script>
<style lang="scss" scoped src="./student-gallery-item.scss"></style>
