<template>
  <teleport to="body">
    <div class="designate-target-container" v-if="currentExposureItemMedia">
      <div class="backdrop" @click="onClickCloseDesignate"></div>
      <div class="designate-box" id="designate-box">
        <img :src="currentExposureItemMedia.image.url" alt="" id="mediaImage" />

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
      </div>
    </div>
  </teleport>
</template>
<style lang="scss" scoped src="./designate-target.scss"></style>
<script lang="ts" src="./designate-target.ts"></script>