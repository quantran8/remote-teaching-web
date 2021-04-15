<template>
  <teleport to="body" v-if="toast">
    <div :class="cssClass">
      <img v-if="toast.bigIcon" class="toast__big-icon" :src="require(`@/assets/${toast.bigIcon}.png`)" />
      <div v-if="toast.message">
        {{ toast.message }}
      </div>
    </div>
  </teleport>
</template>
<style lang="scss" scoped src="./toast.scss"></style>
<script lang="ts" src="./toast.ts"></script>
