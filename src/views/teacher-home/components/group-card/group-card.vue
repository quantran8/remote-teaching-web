<template>
  <BaseCard class="g-card" :style="style">
    <div class="container">
      <div class="g-card__title">
        <h4>{{ title }}</h4>
      </div>
      <p>Members: {{ studentCount }}</p>
      <div class="g-card__schedule">
        <div>Next: {{ formatDate(nextSchedule) }}</div>
        <PlayCircleOutlined v-if="canStartSession(nextSchedule)" />
      </div>
    </div>
  </BaseCard>
</template>
<style lang="scss" src="./group-card.scss"></style>
<script lang="ts" src="./group-card.ts"></script>