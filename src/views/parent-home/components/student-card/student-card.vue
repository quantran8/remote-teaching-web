<template>
  <BaseCard class="user-container">
    <img class="user-avatar" :src="userAvatar" />
    <div class="user-name">{{ name }}</div>
    <div class="next-session mt-20">Class: {{ nextSessionInfo && nextSessionInfo.classInfo.className }}</div>
    <div class="next-session">Next Session: {{ nextSessionInfo && convertDate(nextSessionInfo.nextTime) }}</div>
  </BaseCard>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>
