<template>
  <!-- <div class="cursor" v-if="(isPointerMode && !studentOneAndOneId) || (isPointerMode && student.id == studentOneAndOneId)" :style="pointerStyle">
    <img src="@/assets/icon-select.png" alt="" />
  </div> -->
  <div
    class="annotation-view-container"
    :class="isGalleryView ? 'gallery-view' : ''"
    ref="containerRef"
    :style="{
      borderBottomLeftRadius: hasPalette || isGalleryView ? '10px' : '0px',
      borderBottomRightRadius: hasPalette || isGalleryView ? '10px' : '0px',
      borderBottomWidth: hasPalette || isGalleryView ? '1px' : '0px',
    }"
  >
    <div class="annotation-view-container__image">
      <img :src="imageUrl" id="annotation-img" />
    </div>
    <canvas class="annotation-view-container__canvas" id="canvasOnStudent" ref="canvasRef" />
  </div>
  <transition @enter="actionEnter" @leave="actionLeave">
    <div class="palette-tool" v-if="isPaletteVisible && !isGalleryView">
      <div v-for="{ name, action } in paletteTools" :key="name" class="palette-tool__item" :class="name === toolActive ? 'active' : ''" @click="action">
        <img :src="require(`@/assets/icons/tools-${name}.svg`)" alt="Icon" />
      </div>
      <div class="palette-tool__colors">
        <div
          v-for="color in colorsList"
          :key="color"
          class="palette-tool__colors--item"
          @click="changeColor(color)"
          :style="{
            backgroundColor: color,
            borderStyle: color === activeColor ? 'solid' : '',
            transform: color === activeColor ? 'scale(1.3)' : '',
          }"
        ></div>
      </div>
    </div>
  </transition>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
