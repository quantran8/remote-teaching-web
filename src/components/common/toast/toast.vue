<template>
  <teleport to="body" v-if="toast">
    <div :class="cssClass">{{ toast }}</div>
  </teleport>
</template>
<style lang="scss" scoped src="./toast.scss"></style>
<script lang="ts" src="./toast.ts"></script>