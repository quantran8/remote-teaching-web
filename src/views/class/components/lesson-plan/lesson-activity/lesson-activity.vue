<template>
  <div class="item-container">
    <div class="item-left">
      <div class="icon">
        <BaseIcon :name="activityIcon" class="activity-icon"/>
      </div>
    </div>
    <div class="item-content">
      <div class="name">{{ title }}</div>
      <div class="description">
        <span v-if="type">{{ type }}</span>
        <span v-if="type" class="dot"></span>
        <span>{{ duration }}</span>
      </div>
    </div>
    <div class="item-right"></div>
  </div>
</template>
<style lang="scss" scoped src="./lesson-activity.scss"></style>
<script lang="ts" src="./lesson-activity.ts"></script>