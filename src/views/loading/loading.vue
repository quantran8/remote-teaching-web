<template>
  <div class="loading-container">
    <div class="gl-splash__container">
      <img class="gl-splash__logo" src="@/assets/images/logo-light.png" />
      <div class="gl-splash__divider ant-divider ant-divider-horizontal">
        <div class="gl-progress gl-splash__progress gl-progress--visible">
          <div class="gl-progress__indeterminate"></div>
        </div>
      </div>
      <h1 class="gl-splash__title">{{ titleLoadingText }}</h1>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./loading.scss"></style>
<script lang="ts" src="./loading.ts"></script>
