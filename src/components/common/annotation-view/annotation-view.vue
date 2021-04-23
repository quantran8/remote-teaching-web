<template>
  <div class="annotation-view">
    <img :src="imageUrl" id="annotation-img" @load="boardSetup" />
    <div class="cursor" v-if="isPointerMode" :style="pointerStyle">
      <img src="@/assets/icon-select.png" alt="" />
    </div>
    <div class="canvas-wrap-container" :class="{'has-whiteboard': isShowWhiteBoard }">
      <canvas id="canvasOnStudent" ref="canvasRef"/>
    </div>
  </div>
<!--  <div v-if="isStickerMode" class="sticker-control">-->
<!--    <div class="sticker-control&#45;&#45;list">-->
<!--      <div-->
<!--        class="sticker-control&#45;&#45;list&#45;&#45;item"-->
<!--        v-for="(stickerColor, index) in stickerColors"-->
<!--        :key="index"-->
<!--        :class="{ stickerColor }"-->
<!--        :style="`background-color: ${stickerColor}`"-->
<!--        @click="changeColorSticker(stickerColor)"-->
<!--      ></div>-->
<!--    </div>-->
<!--    <div class="sticker-control&#45;&#45;check" :class="{ 'sticker-control&#45;&#45;check-correct': checkStickers }" @click="checkStickerAdded">-->
<!--      <img src="@/assets/icon-check.svg" alt="" />-->
<!--    </div>-->
<!--  </div>-->
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
