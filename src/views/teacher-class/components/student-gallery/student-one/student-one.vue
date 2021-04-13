<template>
  <div class="container">
    <p class="time-one-to-one">{{ timeCount }}</p>
    <div class="btn-return" @click="backToClass">
      <img class="btn-return__image" src="@/assets/images/exit-1-1.png" />
      <span class="btn-return__text">Return</span>
    </div>
    <StudentCard :key="studentOne.id" :student="studentOne" :setModeOne="false" />
  </div>
</template>
<style lang="scss" scoped src="./student-one.scss"></style>
<script lang="ts" src="./student-one.ts"></script>
