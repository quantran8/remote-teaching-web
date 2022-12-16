<template>
  <div class="crop-image-container">
    <div v-if="isProcessing" class="loader"></div>
    <img
      :class="[isProcessing && 'hidden-image']"
      :src="imgUrl"
      class="media-image-crop"
      id="imgCrop"
      ref="imageRef"
      @load="onImageLoad"
      :style="{ transform: `scale(${metadata.scaleX},${metadata.scaleY})` }"
    />
  </div>
</template>
<style lang="scss" scoped src="./crop-image.scss"></style>
<script lang="ts" src="./crop-image.ts"></script>
