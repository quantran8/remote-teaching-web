<template>
  <div class="tc-one">
    <div class="tc-one__right">
      <p class="tc-one__time">{{ timeCount }}</p>
      <div class="tc-one__action" @click="backToClass">
        <img class="tc-one__action__image" src="@/assets/images/exit-1-1.png" />
        <span class="tc-one__action__text">Return</span>
      </div>
    </div>
    <StudentCard :key="studentOne.id" :student="studentOne" :setModeOne="false" :isLarge="true" />
  </div>
</template>
<style lang="scss" scoped src="./student-one.scss"></style>
<script lang="ts" src="./student-one.ts"></script>
