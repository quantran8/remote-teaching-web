<template>
  <div
    class="annotation-view-container"
    :class="{
      'gallery-view': isGalleryView,
      whiteboard: isGalleryView && isShowWhiteBoard,
      'whiteboard-palette': isGalleryView && isShowWhiteBoard && isPaletteVisible,
      'disabled-pointer': toolActive === '',
    }"
    ref="containerRef"
  >
    <div class="annotation-view-container__image">
      <div class="cursor" v-if="(isPointerMode && !studentOneAndOneId) || (isPointerMode && student.id == studentOneAndOneId)" :style="pointerStyle">
        <img src="@/assets/icon-select.png" alt="" />
      </div>
	  <div v-if ="mediaTypeId === undefined">
        <CropImage
          id="annotation-img"
          v-if="!isGalleryView && image && image.metaData && image.metaData.width > 0 && image.metaData.height > 0"
          :imageUrl="image.url"
          :metadata="image.metaData"
          @img-load="imgLoad"
        />
	    <img v-else-if="typeof imageUrl === 'string' && image" 
	  	  :src="imageUrl" id="annotation-img" v-show="!isGalleryView" @load="imgLoad" 
	    />
	  </div>
	  <div v-else-if="mediaTypeId === 1" class="pdf-content">
		<vue-pdf-embed :source="image.url" class="pdf-config"/>
	  </div>
	  <div v-else-if="mediaTypeId === 2" class="audio-content">
		<audio ref="audioAnnotation" controls class="audio-config">
		<source :src="image.url" type="audio/mp3" />
		Your browser does not support the audio tag.
		</audio>
	  </div>
	  <div v-else class="video-content">
		<video ref="videoAnnotation" controls class="video-config">
		<source :src="image.url" type="video/mp4">
		Your browser does not support the video tag.
		</video>
	  </div>
    </div>
    <canvas class="annotation-view-container__canvas" id="canvasOnStudent" ref="canvasRef" />
    <canvas width="720" height="480"  id="imgCanvas" style="display: none;" />
  </div>
  <transition @enter="actionEnter" @leave="actionLeave">
	<!-- hide temporary with v-if=false -->
    <div class="palette-tool" v-if="false">
      <div
        v-for="{ name, action } in paletteTools"
        :key="name"
        class="palette-tool__item"
        :class="name === toolActive ? 'active' : ''"
        @click="action"
      >
        <img :src="require(`@/assets/icons/tools-${name}.svg`)" alt="Icon" />
      </div>
      <Popover v-model:visible="showListColors" trigger="click blur">
        <template #content>
          <div class="colors-wrap">
            <div
              v-for="(color, index) in colorsList"
              :key="index"
              :style="`background-color: ${color}`"
              :class="color === 'white' ? 'colors-item has-border' : 'colors-item'"
              @click="
                changeColor(color);
                hideListColors();
              "
            ></div>
          </div>
        </template>
        <div class="palette-tool__item" :class="{ active: toolActive === 'colors', white: activeColor === 'white' }">
          <img
            class="tools__item__iconImg"
            :src="require(`@/assets/tools/ColorSelectScribble-${activeColor}.svg`)"
            alt="Color Icon"
            :style="{ color: activeColor }"
          />
        </div>
      </Popover>
    </div>
  </transition>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
