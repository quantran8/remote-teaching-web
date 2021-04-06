<template>
  <div id="header">
    <div id="header__teacher">
      {{teacherName}}
      <img src="@/assets/images/teacher-header-icon.png" alt="" />
    </div>
    <div id="header__class-name">
      {{className}}
    </div>
    <a href="javascript:" id="app-exit" @click="onClickEnd">Exit</a>
  </div>
</template>
<script lang="ts" src="./teacher-page-header.ts"></script>
<style lang="scss" scoped src="./teacher-page-header.scss"></style>
