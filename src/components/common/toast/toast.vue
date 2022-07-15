<template>
  <teleport to="body" v-if="toast">
    <div v-if="toast.bigIcon || toast.icon" :class="toast.isMedal ? 'medalPosition' : 'iconPosition'">
      <Lottie :options="toast.bigIcon" v-if="toast.bigIcon" :height="toast.isMedal ? 140 : 70" :width="toast.isMedal ? 140 : 70" />
      <img :src="toast.icon" v-else :height="70" :width="70" />
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
