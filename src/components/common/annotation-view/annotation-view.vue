<template>
  <div class="annotation-view">
    <img :src="imageUrl" id="annotation-img"/>
    <div class="cursor" :style="pointerStyle"></div>
  </div>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
