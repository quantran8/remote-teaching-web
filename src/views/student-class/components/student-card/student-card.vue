<template>
  <div class="item-container">
    <div class="video" :id="id"></div>
    <div class="mask" :class="{ masked: !videoEnabled }">
      <div class="name">{{ name }}</div>
      <div class="info">
        <BaseTag
          :tag="`${index + 1}`"
          @click="toggleContextMenu"
          v-click-outside="hideContextMenu"
        />
        <BaseButton class="media-button" @click="toggleAudio" draggable="true">
          <BaseIcon :name="audioIcon"></BaseIcon>
        </BaseButton>
        <BaseButton class="media-button" @click="toggleVideo">
          <BaseIcon :name="videoIcon"></BaseIcon>
        </BaseButton>
      </div>
      <div v-if="isContextMenuVisible" class="context-menu">
        <div>Context Menu</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>