<template>
  <div
    v-show="!studentOneAndOneId || isStudentOne"
    :class="[
      'student',
      (isMouseEntered || isExpended) && 'student--hover',
      isExpended && 'student--expended',
      false && 'student--speaking',
      false && 'student--hand-raised',
      isStudentOne && 'student--large',
    ]"
    @mouseleave="onMouseChange(false)"
  >
    <div class="student__content" ref="containerRef">
      <figure class="student__figure" :class="student.raisingHand && 'student__is-question'" @mouseover="onMouseChange(true)">
        <div class="student__video" :class="[student.isPalette && 'student__is-palette']">
          <div :class="[isSpeaking && 'student__is-speaking']" v-show="student.videoEnabled && !isNotJoinned" :id="student.id"></div>
          <img
            class="student__img"
            :class="[isSpeaking && 'student__is-speaking']"
            v-show="!student.videoEnabled || isNotJoinned"
            src="@/assets/student-class/no-avatar.png"
          />
        </div>
      </figure>
      <div :class="['student__info', isNotJoinned && 'student__info--disabled']">
        <h4 class="student__name" :class="{ 'student__info--active': isMouseEntered && !isNotJoinned }" @click="onOneAndOne">
          <img v-if="isLowBandWidth" :src="IconLowWifi" class="student__name--wifi" />
          {{ student.englishName }}
        </h4>
      </div>
      <StudentCardActions
        :student="student"
        :show="isMouseEntered && !isNotJoinned"
        :isLarge="isStudentOne"
        :allowExpend="allowExpend"
        :isExpended="isExpended"
        @expend="expendToggleHandler"
      />
    </div>
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
