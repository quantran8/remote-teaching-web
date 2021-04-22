<template>
  <div class="whiteboard" v-if="currentExposureItemMedia && isLessonPlan">
    <div class="whiteboard__wrap">
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
      <div class="whiteboard__wrap--content">
        <div class="whiteboard__button-show" v-if="!showHideWhiteboard" @click="showWhiteboard">
          Show Whiteboard
          <div class="whiteboard__button-show--icon"><img src="@/assets/icons/arrow-down-thick.svg" alt="" /></div>
        </div>
        <div class="whiteboard__button-hide" v-if="showHideWhiteboard" @click="hideWhiteboard">
          Hide Whiteboard
          <div class="whiteboard__button-hide--icon"><img src="@/assets/icons/arrow-down-thick.svg" alt="" /></div>
        </div>
        <div v-if="!showHideWhiteboard" class="whiteboard__space" />
        <div id="canvas-container" @mousemove="cursorPosition">
          <img :src="imageUrl" @load="boardSetup" id="annotation-img" />
          <div class="wrap-canvas">
            <canvas id="canvasDesignate" />
          </div>
        </div>
        <div v-if="showHideWhiteboard" class="whiteboard__space" />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./whiteboard-palette.scss"></style>
<script lang="ts" src="./whiteboard-palette.ts"></script>
