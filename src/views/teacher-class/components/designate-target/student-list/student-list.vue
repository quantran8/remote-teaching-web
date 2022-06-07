<template>
  <div class="student-item" :id="id" :class="{ 'student-item--selected': selected }">
    <div class="student-item__ava"></div>
    <div class="student-item__name">{{ name }}</div>
  </div>
</template>
<style lang="scss" scoped src="./student-list.scss"></style>
<script lang="ts" src="./student-list.ts"></script>
