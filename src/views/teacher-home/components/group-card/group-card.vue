<template>
  <BaseCard>
    <div class="container">
      <div class="g-card__title">
        <h3>{{ title }}</h3>
      </div>
      <p>Members: {{ studentCount }}</p>
      <div class="g-card__schedule">
        <div>Next: {{ formatDate(nextSchedule) }}</div>
        <PlayCircleOutlined v-if="canStartSession(nextSchedule)" />
      </div>
    </div>
  </BaseCard>
</template>
<style lang="scss" src="./group-card.scss" scoped></style>
<script lang="ts" src="./group-card.ts"></script>