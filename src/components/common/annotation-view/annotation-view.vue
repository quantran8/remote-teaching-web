<template>
  <div class="annotation-view">
    <img :src="imageUrl" id="annotation-img" />
    <div class="cursor" v-if="(isPointerMode && !studentOneAndOneId) || (isPointerMode && student.id == studentOneAndOneId)" :style="pointerStyle">
      <img src="@/assets/icon-select.png" alt="" />
    </div>
    <div
      :style="{
        'border-bottom-left-radius':
          (student?.isPalette && !studentOneAndOneId) || (student?.isPalette && student.id == studentOneAndOneId) ? '0px' : '10px',
        'border-bottom-right-radius':
          (student?.isPalette && !studentOneAndOneId) || (student?.isPalette && student.id == studentOneAndOneId) ? '0px' : '10px',
      }"
      class="canvas-wrap-container"
      :class="{ 'has-whiteboard': isShowWhiteBoard, 'has-palette-tools': student?.isPalette }"
    >
      <canvas v-show="!studentOneAndOneId || student.id == studentOneAndOneId" class="canvas-content" id="canvasOnStudent" ref="canvasRef" />
    </div>
  </div>
  <div class="palette-tool" v-if="(student?.isPalette && !studentOneAndOneId) || (student?.isPalette && student.id == studentOneAndOneId)">
    <div v-for="{ name, action } in paletteTools" :key="name" class="palette-tool__item" @click="action">
      <img :src="require(`@/assets/icons/tools-${name}.svg`)" alt="Icon" />
    </div>
    <div class="palette-tool__colors">
      <div
        v-for="color in colorsList"
        :key="color"
        class="palette-tool__colors--item"
        @click="changeColor(color)"
        :style="{ backgroundColor: color, borderStyle: color === activeColor ? 'solid' : '', transform: color === activeColor ? 'scale(1.3)' : '' }"
      ></div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./annotation-view.scss"></style>
<script lang="ts" src="./annotation-view.ts"></script>
