<template>
  <div class="annotation-view">
    <img :src="imageUrl" id="annotation-img"/>
    <div class="cursor" v-if="isPointerMode" :style="pointerStyle">
      <img src="@/assets/icon-select.png" alt="" />
    </div>
    <div class="canvas-container">
      <canvas id="canvas" ref="canvasRef"/>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
