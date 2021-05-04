<template>
  <teleport to="body" v-if="toast">
    <div v-if="toast.bigIcon" class="medal">
      <Lottie :options="option" :height="140" :width="140" />
    </div>
    <div v-if="toast.message" :class="cssClass">
      <div>
        {{ toast.message }}
      </div>
    </div>
  </teleport>
</template>
<style lang="scss" scoped src="./toast.scss"></style>
<script lang="ts" src="./toast.ts"></script>
