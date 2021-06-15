<template>
  <div class="exposure-detail-container">
    <div class="header-container">
      <!-- <BaseButton @click="onClickBack">Back</BaseButton> -->
      <BaseButton mode="clear" color="black" class="icon" @click="onClickBack">
        <BaseIcon name="icon-back" class="w3-white"></BaseIcon>
      </BaseButton>
      <div class="exposure-title">{{ exposure.name }} ({{ exposure.duration }})</div>
      <div class="exposure-info">
        <img class="exposure-info__icon-info" src="@/assets/images/info.png" @mouseover="toggleInformationBox" @mouseout="toggleInformationBox" />
        <span class="exposure-info__popup-text" :class="showInfo ? 'exposure-info__show' : ''">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Feugiat vivamus
          at augue eget arcu dictum varius duis. Vitae elementum curabitur vitae nunc. Elementum sagittis vitae et leo duis ut diam quam nulla. Lectus
          urna duis convallis convallis tellus. Suspendisse faucibus interdum posuere lorem ipsum. Adipiscing enim eu turpis egestas pretium. Nibh
          nisl condimentum id venenatis a condimentum vitae. Volutpat commodo sed egestas egestas fringilla phasellus. Sed lectus vestibulum mattis
          ullamcorper velit sed.
        </span>
      </div>
    </div>
    <div class="exposure-content">
      <ExposureItem :items="listMedia" @on-click-item="onClickItem" />
    </div>
  </div>
</template>
<style lang="scss" scoped src="./exposure-detail.scss"></style>
<script lang="ts" src="./exposure-detail.ts"></script>
