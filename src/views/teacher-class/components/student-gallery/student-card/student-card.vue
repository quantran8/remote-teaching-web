<template>
  <div
    :class="['student', false && 'student--speaking', false && 'student--hand-raised', isLarge && 'student--large']"
    @mouseleave="onMouseChange(false)"
  >
    <figure class="student__figure" :class="student.raisingHand && 'student__is-question'" @mouseover="onMouseChange(true)">
      <div
        class="student__video"
        :class="[isSpeaking && 'student__is-speaking']"
        v-show="student.videoEnabled && !isNotJoinned"
        :id="student.id"
      ></div>
      <img class="student__img" v-show="!student.videoEnabled || isNotJoinned" src="@/assets/student-class/no-avatar.png" />
    </figure>
    <div class="student__info">
      <h4 class="student__name" :class="isNotJoinned ? 'student__disable' : 'student__enable'" @click="onOneAndOne">
        {{ student.name }}
      </h4>
    </div>
    <StudentCardActions v-if="!isNotJoinned" :student="student" :show="isMouseEntered" :isLarge="isLarge" />
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
