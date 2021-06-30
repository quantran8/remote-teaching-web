<template>
  <div class="lesson-container">
    <div class="lesson-container__header">
      <div class="lesson-container__header-title" :class="[isGalleryView && 'lesson-container__header-title--text-right']">
        <span class="lesson-container__header-title--wrap">
          <span class="lesson-container__header-title--wrap__unit"> Unit: {{ currentUnit }} </span><span class="lesson-container__header-title--wrap__lesson"> (Lesson {{ currentLesson }})</span>
        </span>
      </div>
      <span @click="backToGalleryMode" class="lesson-container__header-back">
        <span v-if="isGalleryView">&#8250;</span>
        <span v-else>&#8249;</span>
      </span>
    </div>
    <div class="lesson-container__body nice-scroll" :class="[isGalleryView && 'd-none']">
      <div id="lesson-container__remaining-time">
        <p>Remaining: {{ remainingTime }}</p>
        <p>
          Item: {{ activityStatistic }} <br />
          Page: {{ page }}
        </p>
        <img class="lesson-container__icon-next" :src="iconNext" @click="onClickPrevNextMedia(NEXT_EXPOSURE)" />
      </div>
      <div class="progress">
        <div class="indicator" :style="{ transform: `scaleX(${progress})` }"></div>
      </div>
      <div class="activities">
        <div v-if="isShowExposureDetail">
          <ExposureDetail :type="exposureTypes.VCP_BLOCK" :exposure="currentExposure" @click-back="onClickCloseExposure" />
          <ExposureDetail :type="exposureTypes.CONTENT_BLOCK" :exposure="currentExposure" @click-back="onClickCloseExposure" />
          <ExposureDetail :type="exposureTypes.TEACHING_ACTIVITY_BLOCK" :exposure="currentExposure" @click-back="onClickCloseExposure" />
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
