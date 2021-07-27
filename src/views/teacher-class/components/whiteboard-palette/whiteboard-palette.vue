<template>
  <div class="palette">
    <ToolsCanvas
      :selector-open="selectorOpen"
      :tool-selected="toolSelected"
      :stroke-width="strokeWidth"
      :stroke-color="strokeColor"
      :sticker-tool="hasStickerTool"
      @tool-selected="clickedTool"
      @update-color="updateColorValue"
      @update-stroke="updateStrokeWidth"
    />
  </div>
  <div class="whiteboard">
    <div class="whiteboard__wrap">
      <div class="whiteboard__wrap--content" :class="isGalleryView && !showHideWhiteboard ? 'gallery-whiteboard-hidden' : 'gallery-whiteboard-show'">
        <div class="whiteboard__button-show" v-if="!showHideWhiteboard" @click="showWhiteboard">
          Show Whiteboard
          <div class="whiteboard__button-show--icon"><img src="@/assets/icons/arrow-down-thick.svg" alt="" /></div>
        </div>
        <div class="whiteboard__button-hide" v-if="showHideWhiteboard" @click="hideWhiteboard">
          Hide Whiteboard
          <div class="whiteboard__button-hide--icon"><img src="@/assets/icons/arrow-down-thick.svg" alt="" /></div>
        </div>
        <div v-if="!showHideWhiteboard" class="whiteboard__space-top" />
        <div id="canvas-container" @mousemove="cursorPosition">
          <CropImage
            v-if="!isGalleryView && image && image.metaData"
            :imageUrl="image.url"
            :metadata="image.metaData"
            id="annotation-img"
            @imgLoad="imgLoad"
          />
          <img v-else-if="typeof imageUrl === 'string'" :src="imageUrl" id="annotation-img" v-show="!isGalleryView" @load="imgLoad" />
          <div class="wrap-canvas">
            <canvas class="canvas-designate" id="canvasDesignate" />
          </div>
        </div>
        <div v-if="showHideWhiteboard" class="whiteboard__space-bottom" />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./whiteboard-palette.scss"></style>
<script lang="ts" src="./whiteboard-palette.ts"></script>
