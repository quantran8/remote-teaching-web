<template>
  <div
    v-if="isShow && !isNotJoinned"
    :class="[
      'student',
      focusedStudent && 'expand',
      isOneToOneStudent && oneAndOne && 'one-student-mode animate__animated animate__zoomIn',
      !isOneToOneStudent && oneAndOne && 'animate__animated animate__zoomOut',
    ]"
    :id="student.id + '__sub-wrapper'"
    @mouseleave="onMouseChange(false)"
    ref="studentRef"
    :style="{
      transform: focusedStudent && !isOneToOneStudent ? `scale(${actualScaleRatio}) translate(${translateX}px, ${translateY}px)` : '',
    }"
  >
    <div class="student__figure" @mouseover="onMouseChange(true)">
      <div :class="student.raisingHand && 'student__is-question'">
        <div class="student__video" :class="[student.isPalette && 'student__is-palette']">

          <div
            v-if="!isUsingAgora && isOneToOneStudent"
			v-show="!isNotJoinned && isTurnOnCamera"
            :class="['student__video--sub', isSpeaking && 'student__is-speaking']"
          >
            <canvas :id="student.id + '__sub'"></canvas>
          </div>

          <div
            v-else
			v-show="!isNotJoinned && isTurnOnCamera"
            :class="['student__video--sub', isSpeaking && 'student__is-speaking']"
            :id="student.id"
          />
          <div v-if="isNotJoinned || !isTurnOnCamera" :class="[isSpeaking && 'student__is-speaking']" class="student__img">
            <img :class="['student-avatar', isOneToOneStudent && 'size-one-one']" alt="boys-avatar" :src="avatarStudent" />
          </div>
        </div>
      </div>
    </div>
    <img v-if="isLowBandWidth" :src="IconLowWifi" class="student--low-wifi" alt="Low bandwidth" />
    <div class="student__info" @mouseover="onMouseChange(true)">
      <p
        class="student__info--name"
        :class="{ enable: !isNotJoinned, active: isMouseEntered && !isNotJoinned, ellipText: true }"
        @click="onOneAndOne"
        :title="student.englishName"
      >
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
