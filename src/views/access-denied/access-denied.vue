<template>
  <div class="page-container">
    <img src="@/assets/images/access-denied.png" alt="" />
    <h1>We are sorry...</h1>
    <p>The page you're trying to access has restricted access.</p>
    <p>Please refer your administrator</p>
    <router-link to="/">
      <div class="btn-homepage">Go To Home Page</div>
    </router-link>
  </div>
</template>
<style lang="scss" scoped src="./access-denied.scss"></style>
<script lang="ts" src="./access-denied.ts"></script>