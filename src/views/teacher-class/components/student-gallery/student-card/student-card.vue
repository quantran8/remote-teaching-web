<template>
  <div
    v-if="isShow && !isNotJoinned"
    :class="[
      'student',
      focusedStudent && 'expand',
      isOneToOneStudent && oneAndOne && 'one-student-mode animate__animated animate__zoomIn',
      !isOneToOneStudent && oneAndOne && 'animate__animated animate__zoomOut',
    ]"
    @mouseleave="onMouseChange(false)"
    ref="studentRef"
    :style="{
      top: focusedStudent && !isOneToOneStudent ? `${currentPosition?.y}px` : '',
      left: focusedStudent && !isOneToOneStudent && currentPosition.right === 0 ? `${currentPosition?.x}px` : '',
      right: focusedStudent && !isOneToOneStudent && currentPosition.right > 0 ? `${currentPosition?.right}px` : '',
      position: focusedStudent && !isOneToOneStudent ? 'sticky' : '',
      transform: focusedStudent && !isOneToOneStudent ? `scale(${scaleOption})` : '',
    }"
  >
    <div class="student__figure" @mouseover="onMouseChange(true)">
      <div :class="student.raisingHand && 'student__is-question'">
        <div class="student__video" :class="[student.isPalette && 'student__is-palette']">
          <canvas
            v-if="!isUsingAgora"
            class="student__video--sub"
            :class="[isSpeaking && 'student__is-speaking', !isTurnOnCamera && 'student__video--disabled']"
            v-show="!isNotJoinned && isTurnOnCamera"
            :id="student.id + '__sub'"
          ></canvas>
          <div
            v-else
            class="student__video--sub"
            :class="[isSpeaking && 'student__is-speaking', !isTurnOnCamera && 'student__video--disabled']"
            v-show="!isNotJoinned && isTurnOnCamera"
            :id="student.id"
          ></div>
          <div :class="[isSpeaking && 'student__is-speaking']" v-show="!isNotJoinned && !isTurnOnCamera" class="student__img">
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
