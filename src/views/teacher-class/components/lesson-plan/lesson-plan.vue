<template>
  <div class="lesson-container">
    <div class="lesson-container__header">
      <div class="lesson-container__header-title" :class="[isGalleryView && 'lesson-container__header-title--text-right']">
        Unit 1:14
      </div>
      <span @click="backToGalleryMode" class="lesson-container__header-back">
        <span v-if="isGalleryView">&#8250;</span>
        <span v-else>&#8249;</span>
      </span>
    </div>
    <div class="lesson-container__body nice-scroll" :class="[isGalleryView && 'd-none']">
      <div id="lesson-container__remaining-time">
        <p>Remaining times: {{ remainingTime }}</p>
        <p>
          Item: {{ activityStatistic }} <br />
          Page: {{ page }}
        </p>
        <img class="lesson-container__icon-next" :src="iconNext" @click="onClickNextMedia" />
      </div>
      <div class="progress">
        <div class="indicator" :style="{ transform: `scaleX(${progress})` }"></div>
      </div>
      <div class="activities">
        <div v-if="isShowExposureDetail">
          <ExposureDetail :exposure="currentExposure" @click-back="onClickCloseExposure" />
        </div>
        <div v-else>
          <LessonActivity
            class="lesson-activity"
            v-for="exposure in exposures"
            :key="exposure.id"
            :id="exposure.id"
            :title="exposure.name"
            :type="exposure.type"
            :duration="exposure.duration"
            :status="exposure.status"
            @click="() => onClickExposure(exposure)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./lesson-plan.scss"></style>
<script lang="ts" src="./lesson-plan.ts"></script>
