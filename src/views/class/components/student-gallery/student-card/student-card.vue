<template>
  <div class="item-container">
    <div class="video">
      <video autoplay loop :muted="!audioEnabled" v-if="videoEnabled">
        <source :src="video" type="video/mp4" />
      </video>
    </div>
    <div class="mask" :class="{ masked: !videoEnabled }">
      <div class="name">{{ name }}</div>
      <div class="info">
        <BaseTag :tag="`${index + 1}`" @click="toggleContextMenu" />
        <BaseIconButton :icon="audioIcon" @click="toggleAudio" />
        <BaseIconButton :icon="videoIcon" @click="toggleVideo" />
      </div>
      <StudentBadge class="badge" :badge="badge" @click="addABadge" />
      <div v-if="isContextMenuVisible" class="context-menu">
        <div>Context Menu</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>