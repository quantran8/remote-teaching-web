<template>
  <div
    :class="[
      'exposure-detail-container',
      isContentBlock && 'content-block',
      isTeachingActivityBlock && 'teaching-block',
      isVCPBlock && 'vcp-block',
      isTransitionBlock && 'transition-block',
      isLpCompleteBlock && 'lp-complete-block',
    ]"
  >
    <div class="header-container">
      <!-- <BaseButton @click="onClickBack">Back</BaseButton> -->
      <div class="header-container__left" v-if="isShowBackButton">
        <BaseButton mode="clear" color="black" class="icon" @click="onClickBack">
          <BaseIcon name="icon-back"></BaseIcon>
        </BaseButton>
      </div>
      <div :class="['header-container__left', isContentBlock && thumbnailContentURL && thumbnailURLDefault && 'thumbnail']" v-if="isContentBlock">
        <img v-if="thumbnailContentURL && thumbnailURLDefault" :src="thumbnailURLDefault" />
      </div>
      <div class="exposure-title">{{ exposureTitle }}</div>
      <div v-if="isShowInfoIcon" class="exposure-info">
        <img class="exposure-info__icon-info" src="@/assets/images/info.png" @mouseover="toggleInformationBox" @mouseout="toggleInformationBox" />
        <div class="exposure-info__popup-text" :class="showInfo ? 'exposure-info__show' : ''">
          <div v-if="!hasZeroTeachingContent">
            <div v-for="{ id, textContent } in exposure.teachingActivityBlockItems" :key="id" v-html="textContent" />
          </div>
          <div v-if="isTransitionBlock">
            <div v-html="exposure.name" />
          </div>
          <div v-if="!isTransitionBlock && hasZeroTeachingContent">
            <Empty imageStyle="max-height: 40px" />
          </div>
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
