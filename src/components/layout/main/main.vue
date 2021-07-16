<template>
  <div class="main">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="content">
      <slot></slot>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
    <div class="disconnected-popup" v-if="isDisconnectedMode && isTeacher">{{ messageText }}</div>
  </div>
</template>
<script src="./main.ts" lang="ts" />
<style src="./main.scss" lang="scss" scoped />
