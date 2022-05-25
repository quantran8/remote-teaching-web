<template>
  <transition-group :class="['student-action', isLarge && 'student-action--large']" tag="div" @enter="actionEnter" :css="false">
    <span v-if="show" @click="onClickClearRaisingHand" :class="['student-action__item', !isRasingHand && 'student-action--hide']">
      <div class="student-action__btn">
        <img src="@/assets/teacher-class/question-small.svg" />
      </div>
    </span>
    <span v-if="show" @click="toggleVideo" class="student-action__item">
      <div class="student-action__btn">
        <img :src="videoIcon" />
      </div>
    </span>
    <span v-if="show" @click="toggleAudio" class="student-action__item">
      <div class="student-action__btn">
        <img :src="audioIcon" />
      </div>
    </span>
    <!-- <span v-if="show" @click="toggleAnnotation" class="student-action__item" :class="{ 'student-action__item--disable': !isOnePalette }">
      <div class="student-action__btn">
        <img :src="paletteIcon" />
      </div>
    </span> -->
    <span v-if="show" @click="addABadge" class="student-action__item">
      <div class="student-action__btn">
        <img src="@/assets/teacher-class/sticker-star-small.svg" />
        <span class="student-action__badge-count">{{ student.badge }}</span>
      </div>
    </span>
    <span v-if="show && isShowExpandIcon" @click="handleExpand" class="student-action__item">
      <div class="student-action__btn">
        <img :src="arrowIcon" style="width: 27px; border-radius: 50%" />
      </div>
    </span>
  </transition-group>
</template>

<style lang="scss" scoped src="./student-card-actions.scss"></style>
<script lang="ts" src="./student-card-actions.ts"></script>
