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
  <div class="sticker-control">
    <div class="sticker-control--list">
      <div
        class="sticker-control--list--item"
        v-for="(stickerColor, index) in stickerColors"
        :key="index"
        :class="{ stickerColor }"
        :style="`background-color: ${stickerColor}`"
        @click="changeColorSticker(stickerColor)"
      ></div>
    </div>
    <div class="sticker-control--check" @click="checkStickerAdded">
      <img src="@/assets/icon-check.svg" alt="" />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
