<template>
  <div class="item-container" :class="{ 'item-done': isCompleted }">
    <div class="item-left">
      <div class="icon">
        <BaseIcon :name="activityIcon" class="activity-icon" />
      </div>
    </div>
    <div class="item-content">
      <div class="name">{{ exposureTitle }}</div>
      <div class="description" v-if="!isExposureLpComplete">
        <span v-if="type">{{ type }}</span>
        <span v-if="type" class="dot"></span>
        <span>{{ formattedDuration }}</span>
      </div>
    </div>
    <div class="item-right" v-if="isCompleted">
      <BaseIcon name="icon-done" class="icon-done" />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./lesson-activity.scss"></style>
<script lang="ts" src="./lesson-activity.ts"></script>
