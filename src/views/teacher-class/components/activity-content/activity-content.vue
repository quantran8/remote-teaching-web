<template>
  <div class="activity-content-container">
    <div
      v-if="currentExposureItemMedia"
      class="content-container"
      :style="contentImageStyle"
    ></div>
    <div class="skeleton" v-if="!currentExposureItemMedia"></div>
    <div v-if="isFlipped" class="mask"></div>
    <div
      class="flip-button"
      :class="{ flipped: isFlipped }"
      @click="toggleView"
    >
      <BaseIcon name="icon-change" class="icon-change" />
    </div>
    <BaseButton class="icon-designate" @click="onClickToggleDesignatingTarget">
      <img src="@/assets/icons/icon-action-designate.svg" alt="" />
    </BaseButton>
  </div>
</template>
<style lang="scss" scoped src="./activity-content.scss"></style>
<script lang="ts" src="./activity-content.ts"></script>