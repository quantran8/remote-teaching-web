<template>
  <teleport to="body" v-if="toast">
    <div v-if="toast.bigIcon" :class="toast.isMedal ? 'medalPosition' : 'iconPosition'">
      <Lottie :options="toast.bigIcon" :height="toast.isMedal ? 140 : 70" :width="toast.isMedal ? 140 : 70" />
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
