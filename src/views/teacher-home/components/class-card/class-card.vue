<template>
  <BaseCard>
    <div class="class" @click="clickToAccess">
      <div class="class__title">
        <LiveCircle class="class__live-dot" v-if="active"/>
        <h5>{{ title }}</h5>
        sample campus
      </div>
      <BaseButton mode="clear" color="primary">{{ btnText }}</BaseButton>
    </div>
  </BaseCard>
  <div class="class-groups">
    <BaseCard @click="clickToAccess" v-for="item in [1, 3, 4]" v-bind:key="item">
      <div class="class-group__item">
        Group-{{ item }}
        <span class="d-block">Members: 12</span>
        <span>Next: 4/1 14:00</span>
      </div>
    </BaseCard>
  </div>
</template>
<style lang="scss" src="./class-card.scss" scoped></style>
<script lang="ts" src="./class-card.ts"></script>