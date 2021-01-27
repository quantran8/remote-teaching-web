<template>
  <div class="annotation-view">
    <img :src="imageUrl" id="annotation-img"/>
    <div class="cursor" v-if="isPointerMode" :style="pointerStyle"></div>
    <div class="canvas-container">
      <canvas id="canvas"/>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
