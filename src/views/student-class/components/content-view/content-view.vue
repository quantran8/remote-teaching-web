<template>
    <div class="content-view" v-if="isLessonPlan">
        <div class="exposure-content" :style="contentImageStyle"></div>
        <div class="mask" v-if="isBlackOutContent"></div>
      </div>
</template>
<style lang="scss" scoped src="./content-view.scss"></style>
<script lang="ts" src="./content-view.ts"></script>