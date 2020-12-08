<template>
  <div class="item-container" :class="{ 'item-active': isAudioHightlight }">
    <div class="video" :id="id"></div>
    <div class="mask" :class="{ masked: !videoEnabled }">
      <div class="name">{{ name }}</div>
      <StudentBadge class="badge" :badge="badge" v-if="showBadge" />
      <div class="info" v-if="!showBadge">
        <BaseButton
          class="media-button"
          :class="{ hightlight: isAudioHightlight }"
        >
          <BaseIcon :name="audioIcon"></BaseIcon>
        </BaseButton>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>