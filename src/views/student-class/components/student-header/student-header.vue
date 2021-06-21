<template>
  <div class="sc-header">
    <div class="sc-header__left">
      <div class="sc-header__left--under"></div>
      <h2 class="sc-header__trainer">{{ teacher?.name }}</h2>
      <div class="sc-header__icon" ref="classActionImageRef">
        <img v-if="classAction" :src="require(`@/assets/icons/icon-action-${classAction}.png`)" alt="Icon" />
      </div>
    </div>
    <div class="sc-header__right">
      <!-- <div class="try-button" v-if="!studentIsDisconnected" @click="disconnectSignalR">Manual disconnect SIGNALR/AGORA</div> -->
      <h1 class="sc-header__title">{{ classInfo?.className }}</h1>
      <a class="sc-header__exit" @click="onClickEnd">
        <MatIcon type="close" class="red-close" />
        <span>Exit</span>
      </a>
    </div>
  </div>
</template>
<script lang="ts" src="./student-header.ts"></script>
<style lang="scss" scoped src="./student-header.scss"></style>
