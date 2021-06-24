<template>
  <div
    v-if="isShow"
    :class="[
      'student',
      false && 'student--speaking',
      false && 'student--hand-raised',
      focusedStudent && 'expand',
      isOneToOneStudent && 'one-student-mode',
    ]"
    @mouseleave="onMouseChange(false)"
    ref="studentRef"
    :style="{
      top: focusedStudent && !isOneToOneStudent ? `${currentPosition?.y}px` : '',
      left: focusedStudent && !isOneToOneStudent ? `${currentPosition?.x}px` : '',
      position: focusedStudent && !isOneToOneStudent ? 'sticky' : '',
      transform: focusedStudent && !isOneToOneStudent ? 'scale(2)' : '',
    }"
  >
    <div class="student__figure" :class="student.raisingHand && 'student__is-question'" @mouseover="onMouseChange(true)">
      <div class="student__video" :class="[student.isPalette && 'student__is-palette']">
        <div
          class="student__video--sub"
          :class="[isSpeaking && 'student__is-speaking', !isTurnOnCamera && 'student__video--disabled']"
          v-show="!isNotJoinned"
          :id="student.id"
        ></div>
        <div :class="[isSpeaking && 'student__is-speaking']" v-show="isNotJoinned" class="student__img">
          <img alt="boys-avatar" src="@/assets/boy.svg" />
        </div>
      </div>
    </div>
    <div class="student__info" @mouseover="onMouseChange(true)">
      <p
        class="student__info--name"
        :class="{ enable: !isNotJoinned, active: isMouseEntered && !isNotJoinned, ellipText: !isMouseEntered }"
        @click="onOneAndOne"
      >
        <img v-if="isLowBandWidth" :src="IconLowWifi" class="student__name--wifi" />
        {{ student.englishName }}
      </p>
    </div>
    <StudentCardActions v-if="!isNotJoinned" :student="student" :show="isMouseEntered" :focusedStudent="focusedStudent" />
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
