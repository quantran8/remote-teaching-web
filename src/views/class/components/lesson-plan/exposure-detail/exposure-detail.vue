<template>
  <div class="exposure-detail-container">
    <div class="header-container">
      <!-- <BaseButton @click="onClickBack">Back</BaseButton> -->
      <BaseButton mode="clear" color="black" class="icon" @click="onClickBack">
        <BaseIcon name="icon-back" class="w3-white"></BaseIcon>
      </BaseButton>
      <div class="exposure-title">
        {{ exposure.name }} ({{ exposure.duration }})
      </div>
    </div>
    <div class="exposure-content">
      <ExposureItem
        v-for="item in exposure.items"
        :key="item.id"
        :title="item.name"
        :collapsed="false"
        :items="item.media"
        @on-click-item="onClickItem"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./exposure-detail.scss"></style>
<script lang="ts" src="./exposure-detail.ts"></script>