<template>
  <router-link to="/student-view/test">
    <BaseCard class="user-container">
    <img class="user-avatar" :src="userAvatar" />
    <div class="user-name">{{ name }}</div>
  </BaseCard>
  </router-link>
  
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>