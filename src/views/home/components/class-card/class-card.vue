<template>
  <BaseCard>
    <div class="container">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <router-link :to="'/class/' + id">Start</router-link>
    </div>
  </BaseCard>
</template>
<style lang="scss" src="./class-card.scss" scoped></style>
<script lang="ts" src="./class-card.ts"></script>