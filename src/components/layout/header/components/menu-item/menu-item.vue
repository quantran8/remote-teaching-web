<template>
  <!-- <div class="menu-item">
    <div
      class="menu-item-content"
      @click="showPopup"
      v-click-outside="hidePopup"
    >
      <slot></slot>
      <BaseIcon class="menu-item-dropdown-icon" name="keyboard_arrow_down" />
    </div>
    <div class="menu-item-popup" v-if="popup">
      <slot name="popup"></slot>
    </div>
  </div> -->
  <div class="popover__wrapper">
    <slot></slot>
    <div class="popover__content">
        <slot name="popup"></slot>
    </div>
  </div>
</template>




<style lang="scss" src="./menu-item.scss"></style>

<script lang="ts" src="./menu-item.ts" />
