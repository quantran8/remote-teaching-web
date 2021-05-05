<template>
  <div class="item-container">
    <div class="item-header" @click="toggleContent">
      <div class="item-title">{{ title }}</div>
      <BaseIcon
        name="icon-arrow-down"
        class="collapse-icon"
        :class="{ collapsed: isToggle }"
      ></BaseIcon>
    </div>
    <div class="item-content nice-scroll" :class="{ 'content-collapsed': isToggle } ">
      <div
        @click="() => onClickItem(item)"
        class="item-media"
        v-for="(item, index) in items"
        :key="item.id"
        :class="{ 'item-active': item.id === currentExposureItemMedia?.id }"
      >
        <img :src="item.image.url" class="media-image" />
        <div v-if="items.length > 1" class="item-tag">{{ index + 1 }}</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./exposure-item.scss">
</style>
<script lang="ts" src="./exposure-item.ts"></script>