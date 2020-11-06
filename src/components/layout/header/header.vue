<template>
  <div class="header">
    <slot name="leading">
      <a href="/">
        <img src="@/assets/logo-white.svg" alt="" class="logo" />
      </a>
    </slot>
    <div class="h-spacer"></div>
    <div class="content">
      <slot name="title">
        <div class="title">{{ title }}</div>
      </slot>
      <slot />
    </div>
    <slot name="actions"></slot>
  </div>
</template>
<style src="./header.scss" lang="scss" scoped ></style>
<script src="./header.ts" lang="ts"></script>
