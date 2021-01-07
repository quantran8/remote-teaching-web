<template>
  <div class="content-view" id="content-view" @click="onClickExposureContent">
    <div
      class="exposure-content"
      :style="contentImageStyle"
      id="exposure-content"
    ></div>
    <DesignateRectangle
      v-for="shape of rectangles"
      :key="shape.id"
      :id="shape.id"
      :x="shape.x"
      :y="shape.y"
      :width="shape.width"
      :height="shape.height"
      :zIndex="shape.zIndex"
    />
    <DesignateCircle
      v-for="shape of circles"
      :key="shape.id"
      :id="shape.id"
      :x="shape.x"
      :y="shape.y"
      :radius="shape.radius"
      :zIndex="shape.zIndex"
    />
    <div class="mask" v-if="masked"></div>
  </div>
</template>
<style lang="scss" scoped src="./content-view.scss"></style>
<script lang="ts" src="./content-view.ts"></script>
