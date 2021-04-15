<template>
  <div class="whiteboard" v-if="currentExposureItemMedia">
    <div class="whiteboard__wrap">
      <div class="whiteboard__button" v-if="!showHideWhiteboard" @click="showWhiteboard">show whiteboard</div>
      <div class="whiteboard__button" v-if="showHideWhiteboard" @click="hideWhiteboard">hide whiteboard</div>
      <div id="canvas-container" @mousemove="cursorPosition">
        <img :src="currentExposureItemMedia?.image.url" @load="boardSetup" id="annotation-img" />
        <div class="wrap-canvas">
          <canvas id="canvasDesignate" />
        </div>
      </div>
      <ToolsCanvas
        v-if="currentExposureItemMedia"
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
  </div>
</template>
<style lang="scss" scoped src="./whiteboard-palette.scss"></style>
<script lang="ts" src="./whiteboard-palette.ts"></script>
