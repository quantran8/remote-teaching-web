<template>
  <div class="lesson-container">
    <div class="title">Lesson Plan</div>
    <p>- Activities: {{ currentActivityId }}/{{ totalActivities }}</p>
    <p>- Remaining times: {{ remainingTime() }}</p>
    <div class="progress">
      <div
        class="indicator"
        :style="{ transform: `scaleX(${progress})` }"
      ></div>
    </div>
    <div class="activities">
      <LessonActivity
        class="lesson-activity"
        :class="{
          'item-active': activity.id === currentActivityId
        }"
        v-for="activity in activities"
        :key="activity.id"
        :id="activity.id"
        :title="activity.id + '. ' + activity.title"
        :type="activity.type"
        :duration="activity.duration"
        @click="() => setCurrentActivity(activity.id)"
      ></LessonActivity>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./lesson-plan.scss"></style>
<script lang="ts" src="./lesson-plan.ts"></script>