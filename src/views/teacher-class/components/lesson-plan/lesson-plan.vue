<template>
  <div class="lesson-container">
    <div class="lesson-container__header">
      <div class="lesson-container__header-title">Lesson Plan</div>
      <a href="javascript:" @click="backToGalleryMode" class="lesson-container__header-back">&rsaquo;</a>
    </div>
    <div class="lesson-container__body nice-scroll">
      <p>- Activities: {{ activityStatistic }}</p>
      <p>- Remaining times: {{ remainingTime }}</p>
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
