<template>
  <div class="page-container">
    <img src="@/assets/images/not-found.png" alt="" />
    <h1>Error 404 - Page Not Found...</h1>
    <p>We can't seem to find the page you're looking for.</p>
    <router-link to="/">
      <div class="btn-homepage">Go To Home Page</div>
    </router-link>
  </div>
</template>
<style lang="scss" scoped src="./not-found.scss"></style>
<script lang="ts" src="./not-found.ts"></script>