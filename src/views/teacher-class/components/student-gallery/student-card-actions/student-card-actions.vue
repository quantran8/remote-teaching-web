<template>
  <transition-group :class="['student-action', isLarge && 'student-action--large']" tag="div" @enter="actionEnter" :css="false">
    <a v-if="show" href="javascript:void(0)" @click="toggleVideo" class="student-action__item">
      <div class="student-action__btn">
        <img :src="videoIcon" />
      </div>
    </a>
    <a v-if="show" href="javascript:void(0)" @click="toggleAudio" class="student-action__item" draggable="true" @dragstart="onDragStart">
      <div class="student-action__btn">
        <img :src="audioIcon" />
      </div>
    </a>
    <a v-if="show" href="javascript:void(0)" class="student-action__item">
      <div class="student-action__btn">
        <img src="@/assets/teacher-class/touch-off-small.svg" />
      </div>
    </a>
    <a v-if="show" href="javascript:void(0)" @click="addABadge" class="student-action__item">
      <div class="student-action__btn">
        <img src="@/assets/teacher-class/sticker-star-small.svg" />
        <span class="student-action__badge-count">{{ student.badge }}</span>
      </div>
    </a>
  </transition-group>
</template>

<style lang="scss" scoped src="./student-card-actions.scss"></style>
<script lang="ts" src="./student-card-actions.ts"></script>
