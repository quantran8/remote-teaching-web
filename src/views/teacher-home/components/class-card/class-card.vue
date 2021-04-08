<template>
  <BaseCard>
    <div class="container">
      <div class="class-title">
        <LiveCircle class="live-dot" v-if="active"/>
        <h3>{{ title }}</h3>
      </div>
      <p>{{ description }}</p>
    </div>
  </BaseCard>
</template>
<style lang="scss" src="./class-card.scss" scoped></style>
<script lang="ts" src="./class-card.ts"></script>