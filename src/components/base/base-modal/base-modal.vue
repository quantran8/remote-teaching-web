<template>
  <teleport to="body">
    <div class="base-modal" @click="onClickDismiss">
      <slot></slot>
    </div>
  </teleport>
</template>
<style lang="scss" src="./base-modal.scss"></style>
<script lang="ts" src="./base-modal.ts"></script>