<template>
  <div
    :class="['exposure-detail-container', isContentBlock && 'content-block', isTeachingActivityBlock && 'teaching-block', isVCPBlock && 'vcp-block']"
  >
    <div class="header-container">
      <!-- <BaseButton @click="onClickBack">Back</BaseButton> -->
      <div class="header-container__left" v-if="isVCPBlock">
        <BaseButton mode="clear" color="black" class="icon" @click="onClickBack">
          <BaseIcon name="icon-back" class="w3-white"></BaseIcon>
        </BaseButton>
      </div>
      <div :class="['header-container__left', isContentBlock && 'thumbnail']" v-if="isContentBlock">
        <img v-if="thumbnailContentURL" :src="thumbnailURLDefault" />
      </div>
      <div class="exposure-title">{{ exposureTitle }}</div>
      <div v-if="isContentBlock" class="exposure-info">
        <img class="exposure-info__icon-info" src="@/assets/images/info.png" @mouseover="toggleInformationBox" @mouseout="toggleInformationBox" />
        <div class="exposure-info__popup-text" :class="showInfo ? 'exposure-info__show' : ''">
          <div v-if="!hasZeroTeachingContent">
            <span v-for="{ id, textContent } in exposure.teachingActivityBlockItems" :key="id"> + {{ textContent }}</span>
          </div>
          <Empty v-if="hasZeroTeachingContent" />
        </div>
      </div>
    </div>
    <div class="exposure-content">
      <ExposureItem
        :teachingContent="exposure.teachingActivityBlockItems"
        :isTeachingBlock="isTeachingActivityBlock"
        :isContentBlock="isContentBlock"
        :items="listMedia"
        @on-click-item="onClickItem"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./exposure-detail.scss"></style>
<script lang="ts" src="./exposure-detail.ts"></script>
