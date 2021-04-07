<template>
  <BaseCard>
    <div class="container">
      <div class="group-title">
        <h3>{{ title }}</h3>
      </div>
      <p>Members: {{ studentCount }}</p>
      <div>Next: {{ formatDate(nextSchedule) }}</div>
    </div>
  </BaseCard>
</template>
<style lang="scss" src="./group-card.scss" scoped></style>
<script lang="ts" src="./group-card.ts"></script>