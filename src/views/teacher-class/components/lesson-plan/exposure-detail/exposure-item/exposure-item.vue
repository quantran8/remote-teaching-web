<template>
  <div class="item-container">
    <div class="item-content nice-scroll">
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
<style lang="scss" scoped src="./exposure-item.scss"></style>
<script lang="ts" src="./exposure-item.ts"></script>
