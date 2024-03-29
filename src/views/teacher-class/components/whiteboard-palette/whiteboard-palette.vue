<template>
  <div class="palette">
    <ToolsCanvas
      :tool-selected="toolSelected"
      :stroke-width="strokeWidth"
      :stroke-color="strokeColor"
      @tool-selected="clickedTool"
      @update-color="updateColorValue"
      @update-stroke="updateStrokeWidth"
    />
  </div>
  <div v-if="helperInfo" :class="['helper-displayed', (helperVideoStatus || isHelper) && 'active']">
    <div v-if="!isHelper" class="toggle-bar">
      <div>
        <span style="font-style: italic; text-decoration: underline">{{ helperInfo.name }}</span>
      </div>
      <div>
        <Button
          :disabled="toggleHelperVideoLoading"
          v-if="!helperVideoStatus"
          type="link"
          style="color: white; font-size: 15px; font-weight: 600"
          @click="toggleHelperVideo(true)"
        >
          {{ showHelperVideoText }}
          <DownOutlined style="font-size: 12px" />
        </Button>
        <Button
          :disabled="toggleHelperVideoLoading"
          v-else
          type="link"
          style="color: white; font-size: 15px; font-weight: 600"
          @click="toggleHelperVideo(false)"
        >
          {{ hideHelperVideoText }}
          <UpOutlined style="font-size: 12px" />
        </Button>
      </div>
    </div>
    <div v-show="helperVideoStatus || isHelper" class="video">
      <HelperCard />
      <custom-spinner />
    </div>
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
        <div id="canvas-container">
          <div v-if="mediaTypeId === undefined">
            <CropImage
              v-if="!isGalleryView && image && image.metaData && image.metaData.width > 0 && image.metaData.height > 0"
              :imageUrl="image.url"
              :metadata="image.metaData"
              :canvasImage="image"
              id="annotation-img"
              @img-load="imgLoad"
            />
            <img v-else-if="typeof imageUrl === 'string' && image" :src="imageUrl" id="annotation-img" v-show="!isGalleryView" @img-load="imgLoad" />
          </div>
          <div v-else-if="mediaTypeId === 1 && image && typeof image.url === 'string' && isValidUrl" class="pdf-content">
            <vue-pdf-embed :source="image.url" class="pdf-config" />
          </div>
          <div v-else-if="mediaTypeId === 2 && image && typeof image.url === 'string' && isValidUrl" class="audio-content">
            <audio ref="audio" controls class="audio-config">
              <source :src="image.url" type="audio/mp3" />
              Your browser does not support the audio tag.
            </audio>
          </div>
          <div v-else-if="mediaTypeId === 3 && image && typeof image.url === 'string' && isValidUrl" class="video-content">
            <video ref="video" controls class="video-config">
              <source :src="image.url" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div ref="wrapCanvasRef" class="wrap-canvas">
            <canvas class="canvas-designate" id="canvasDesignate" />
          </div>
          <div class="teacher-use-only-message" v-if="isTeacherUseOnly">
            {{ forTeacherUseOnlyText }}
          </div>
          <div class="wrap-zoom-icon">
            <div class="zoom-icon-container">
              <div @click="zoomOut" class="zoom-container">
                <img class="zoom-icon" src="@/assets/icons/zoom-out.png" />
              </div>
              <div @click="zoomIn" class="zoom-container">
                <img class="zoom-icon" src="@/assets/icons/zoom-in.png" />
              </div>
            </div>
            <span class="zoom-percentage">{{ zoomPercentage }}%</span>
          </div>
        </div>
        <div v-if="showHideWhiteboard" class="whiteboard__space-bottom" />
      </div>
    </div>
    <div v-if="!isGalleryView && image && image.metaData && !showHideWhiteboard" class="target-actions">
      <Space>
        <span v-if="hasTargets">{{ targetText }} {{ targetsNum }}</span>
        <Button v-if="hasTargets" @click="showHidePreviewModal" :disabled="disablePreviewBtn">Preview</Button>
      </Space>
      <Space v-if="hasTargets">
        <Button @click="showAllTargets" :disabled="disableShowAllTargetsBtn">{{ showAllTargetTextBtn }}</Button>
        <Button @click="hideAllTargets" :disabled="disableHideAllTargetsBtn">{{ hideAllTargetTextBtn }}</Button>
      </Space>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./whiteboard-palette.scss"></style>
<script lang="ts" src="./whiteboard-palette.ts"></script>
