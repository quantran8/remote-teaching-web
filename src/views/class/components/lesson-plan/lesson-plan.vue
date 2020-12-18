<template>
  <div class="lesson-container">
    <div class="title">Lesson Plan</div>
    <p>- Activities: {{ 1 }}/{{ exposures.length }}</p>
    <p>- Remaining times: {{ remainingTime }}</p>
    <div class="progress">
      <div
        class="indicator"
        :style="{ transform: `scaleX(${progress})` }"
      ></div>
    </div>
    <div class="activities">
      <ExposureDetail
        v-if="currentExposure"
        @click-back="onClickCloseExposure"
      ></ExposureDetail>
      <div v-else>
        <LessonActivity
          class="lesson-activity"
          v-for="exposure in exposures"
          :key="exposure.id"
          :id="exposure.id"
          :title="exposure.name"
          :type="exposure.type"
          :duration="exposure.duration"
          @click="() => setCurrentExposure(exposure.id)"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./lesson-plan.scss"></style>
<script lang="ts" src="./lesson-plan.ts"></script>