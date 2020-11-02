<template>
  <div class="activity-content-container">
    <div class="content"></div>
    <div class="skeleton"></div>
    <div v-if="isFlipped" class="mask"></div>
    <div
      class="flip-button"
      :class="{ flipped: isFlipped }"
      @click="toggleView"
    >
      <BaseIcon name="icon-change" />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./activity-content.scss"></style>
<script lang="ts" src="./activity-content.ts"></script>