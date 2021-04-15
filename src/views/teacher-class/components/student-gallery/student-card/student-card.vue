<template>
  <div
    :class="['student', false && 'student--speaking', false && 'student--hand-raised', isLarge && 'student--large']"
    @mouseover="onMouseChange(true)"
    @mouseleave="onMouseChange(false)"
  >
    <figure class="student__figure">
      <div class="student__video" v-show="student.videoEnabled" :id="student.id"></div>
      <img class="student__img" v-show="!student.videoEnabled" src="@/assets/student-class/no-avatar.png" />
      <img v-if="student.raisingHand" @click="onClickClearRaisingHand" class="student__hand" src="@/assets/student-class/hand.svg" />
    </figure>
    <div class="student__info">
      <h4 class="student__name" @click="onOneAndOne">{{ student.name }}</h4>
    </div>
    <StudentCardActions :student="student" :show="isMouseEntered" :isLarge="isLarge" />
  </div>

  <!--        Comment BaseTag but DO NOT remove this-->
  <!--        <BaseTag-->
  <!--          draggable="true"-->
  <!--          @dragstart="onDragStart"-->
  <!--          :tag="`${index + 1}`"-->
  <!--          @click="toggleContextMenu"-->
  <!--          v-click-outside="hideContextMenu"-->
  <!--        />-->

  <div class="interactive" v-if="showCorrectAnswer">
    <BaseIcon name="icon-check-mark" v-if="interactive.status === 2"></BaseIcon>

    <StudentBadge class="interactive-badge" :badge="interactive.correct" v-else-if="interactive.status === 1" />
  </div>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>
