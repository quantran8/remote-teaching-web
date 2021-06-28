<template>
  <div :class="['item-container']">
    <div :class="['item-content nice-scroll', isContent && 'content-block']">
      <div
        v-for="(item, index) in items"
        @click="() => onClickItem(item)"
        class="item-media"
        :key="item.id"
        :class="{ 'item-active': item.id === currentExposureItemMedia?.id, 'content-block': isContent }"
      >
        <img v-if="!isTeaching" :src="item.image.url" class="media-image" />
        <div v-if="items.length > 1 && !isTeaching" class="item-tag">{{ index + 1 }}</div>
        <Tooltip v-else placement="topRight">
          <template #title>
            <span>{{ item?.textContent }}</span>
          </template>
          <img :src="item.image.url" class="media-image" />
          <div v-if="items.length > 1" class="item-tag">{{ index + 1 }}</div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./exposure-item.scss"></style>
<script lang="ts" src="./exposure-item.ts"></script>
