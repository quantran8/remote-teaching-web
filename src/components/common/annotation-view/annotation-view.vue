<template>
  <div class="annotation-view">
    <img :src="imageUrl" id="annotation-img" @load="boardSetup" />
    <div class="cursor" v-if="isPointerMode" :style="pointerStyle">
      <img src="@/assets/icon-select.png" alt="" />
    </div>
    <div class="canvas-wrap-container" :class="{ 'has-whiteboard': isShowWhiteBoard }">
      <canvas class="canvas-content" id="canvasOnStudent" ref="canvasRef" />
    </div>
  </div>
  <div class="palette-tool" v-if="isDrawMode">
    <div @click="addStar">Add Star</div>
    <div @click="clearStar">Clear Stars</div>
  </div>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
