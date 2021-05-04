<template>
  <teleport to="body" v-if="toast">
    <transition name="medal">
      <div v-if="toast.bigIcon" class="medal">
        <img class="toast__big-icon" :src="require(`@/assets/${toast.bigIcon}.png`)" />
      </div>
    </transition>
    <div v-if="toast.message" :class="cssClass">
      <div>
        {{ toast.message }}
      </div>
    </div>
  </teleport>
</template>
<style lang="scss" scoped src="./toast.scss"></style>
<script lang="ts" src="./toast.ts"></script>
