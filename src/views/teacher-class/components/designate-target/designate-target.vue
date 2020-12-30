<template>
  <teleport to="body">
    <div class="designate-target-container" v-if="currentExposureItemMedia">
      <div class="backdrop" @click="onClickCloseDesignate"></div>
      <div class="designate-box" id="designate-box">
        <img :src="currentExposureItemMedia.image.url" alt="" id="mediaImage" />
        <!-- <div
          v-for="shape of shapes"
          :key="shape.id"
          :id="shape.id"
          class="resizable draggable"
          :class="{
            circle: shape.type === 'circle',
            rectangle: shape.type === 'rectangle',
          }"
          :style="() => getStyle(shape)"
          @click.prevent="() => onClickRectangle(shape)"
        /> -->
        <!-- <div
          v-if="addingCircle"
          :id="addingCircle.id"
          class="circle"
          :style="() => getStyle(addingCircle)"
          @click.prevent="() => onClickCircle(addingCircle)"
        /> -->

        <Rectangle
          v-for="shape of rectangles"
          :key="shape.id"
          :id="shape.id"
          :x="shape.x"
          :y="shape.y"
          :width="shape.width"
          :height="shape.height"
        ></Rectangle>

        <Circle
          v-for="shape of circles"
          :key="shape.id"
          :id="shape.id"
          :x="shape.x"
          :y="shape.y"
          :radius="shape.radius"
        ></Circle>

        <Rectangle
          v-if="addingRect"
          :id="addingRect.id"
          :x="addingRect.x"
          :y="addingRect.y"
          :width="addingRect.width"
          :height="addingRect.height"
        ></Rectangle>
        <Circle
          v-if="addingCircle"
          :id="addingCircle.id"
          :x="addingCircle.x"
          :y="addingCircle.y"
          :radius="addingCircle.radius"
        ></Circle>


         <Rectangle
          v-if="previewRect"
          :id="previewRect.id"
          :x="previewRect.x"
          :y="previewRect.y"
          :width="previewRect.width"
          :height="previewRect.height"
        ></Rectangle>
         <Circle
          v-if="previewCircle"
          :id="previewCircle.id"
          :x="previewCircle.x"
          :y="previewCircle.y"
          :radius="previewCircle.radius"
        ></Circle>
        <!-- <div
          v-if="addingRect"
          :id="addingRect.id"
          class="rectangle"
          :style="() => getStyle(addingRect)"
          @click.prevent="() => onClickRectangle(addingRect)"
        /> -->
      </div>
    </div>
  </teleport>
</template>
<style lang="scss" scoped src="./designate-target.scss"></style>
<script lang="ts" src="./designate-target.ts"></script>