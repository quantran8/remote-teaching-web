<template>
  <div class="annotation-view">
    <img :src="imageUrl" id="annotation-img" />
    <div class="cursor" v-if="isPointerMode" :style="pointerStyle">
      <img src="@/assets/icon-select.png" alt="" />
    </div>
    <div class="canvas-wrap-container" :class="{ 'has-whiteboard': isShowWhiteBoard, 'has-palette-tools': isDrawMode }">
      <canvas class="canvas-content" id="canvasOnStudent" ref="canvasRef" />
    </div>
  </div>
  <div class="palette-tool" v-if="isDrawMode">
    <div class="palette-tool__item" @click="addStar">
      <img :src="require(`@/assets/icons/tools-star.svg`)" alt="Icon" />
    </div>
    <div class="palette-tool__item" @click="clearStar">
      <img :src="require(`@/assets/icons/tools-clear.svg`)" alt="Icon" />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
