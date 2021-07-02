<template>
  <div class="page-container">
    <img src="@/assets/student-class/bear-confuse.png" alt="" />
    <h1>{{ title }}</h1>
    <p>{{ contentFirst }}</p>
    <p>{{ contentSecond }}</p>
    <router-link to="/">
      <div class="btn-homepage">{{ goTo }}</div>
    </router-link>
  </div>
</template>
<style lang="scss" scoped src="./disconnect-issue.scss"></style>
<script lang="ts" src="./disconnect-issue.ts"></script>
