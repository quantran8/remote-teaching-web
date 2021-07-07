<template>
  <div class="page-container">
    <img src="@/assets/images/not-found.png" alt="" />
    <h1>{{ pageNotFoundText }}</h1>
    <p>{{ descriptionText }}</p>
    <router-link to="/">
      <div class="btn-homepage">{{ goToPageText }}</div>
    </router-link>
  </div>
</template>
<style lang="scss" scoped src="./not-found.scss"></style>
<script lang="ts" src="./not-found.ts"></script>
