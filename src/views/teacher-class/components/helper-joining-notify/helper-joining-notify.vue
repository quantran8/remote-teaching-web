<template>
  <div class="helper-joining-notify">
    {{ notifyPart1Text }} <span @click="onSubmit('yes')">{{ notifyPart2Text }}</span> {{ notifyPart3Text }}
    <span @click="onSubmit('no')">{{ notifyPart4Text }}</span
    >.
  </div>
</template>
<style lang="scss" scoped src="./helper-joining-notify.scss"></style>
<script lang="ts" src="./helper-joining-notify.ts"></script>
