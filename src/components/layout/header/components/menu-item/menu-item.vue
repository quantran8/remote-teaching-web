<template>
  <div class="_item_wrapper" @click="togglePopup" v-click-outside="hidePopup">
    <slot></slot>
    <BaseIcon
      v-if="expandable"
      class="_expand_icon"
      name="keyboard_arrow_down"
    />
    <div class="_popup_wrapper" :class="{ _popup_visible: popup }">
      <slot name="popup"></slot>
    </div>
  </div>
</template>

<style lang="scss" src="./menu-item.scss"></style>
<script lang="ts" src="./menu-item.ts" />
