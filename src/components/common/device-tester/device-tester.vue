<template>
  <div class="device-tester">
    <Modal v-model:visible="visible" title="System check" :footer="null" @ok="handleOk">
      <div class="device-tester__mute">
        <div>Mute</div>
        <Switch v-model:checked="checked" />
      </div>
      <div class="device-tester__volumn">
        <div>Mic Test</div>
        <Switch v-model:checked="checked" />
      </div>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./device-tester.scss"></style>
<script lang="ts" src="./device-tester.ts"></script>
