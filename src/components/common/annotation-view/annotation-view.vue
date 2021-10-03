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
    :style="{
      borderBottomLeftRadius: (hasPalette && isLessonPlan) || (isGalleryView && isShowWhiteBoard && hasPalette) ? '10px' : '0px',
      borderBottomRightRadius: (hasPalette && isLessonPlan) || (isGalleryView && isShowWhiteBoard && hasPalette) ? '10px' : '0px',
      borderBottomWidth: (hasPalette && isLessonPlan) || (isGalleryView && isShowWhiteBoard && hasPalette) ? '1px' : '0px',
    }"
  >
    <div class="annotation-view-container__image">
      <div class="cursor" v-if="(isPointerMode && !studentOneAndOneId) || (isPointerMode && student.id == studentOneAndOneId)" :style="pointerStyle">
        <img src="@/assets/icon-select.png" alt="" />
      </div>
      <CropImage id="annotation-img" v-if="!isGalleryView && image && image.metaData" :imageUrl="image.url" :metadata="image.metaData" />
      <img v-else-if="typeof imageUrl === 'string'" :src="imageUrl" id="annotation-img" v-show="!isGalleryView && imageUrl" />
    </div>
    <canvas class="annotation-view-container__canvas" id="canvasOnStudent" ref="canvasRef" />
  </div>
  <transition @enter="actionEnter" @leave="actionLeave">
    <div class="palette-tool" v-if="(isLessonPlan && isPaletteVisible) || (isGalleryView && isShowWhiteBoard && isPaletteVisible)">
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
