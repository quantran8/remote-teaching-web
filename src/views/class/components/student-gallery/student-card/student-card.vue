<template>
  <div class="item-container">
    <div class="video" :id="id"></div>
    <div class="mask" :class="{ masked: !videoEnabled }">
      <div class="name">{{ name }}</div>
      <div class="info">
        <BaseTag
          draggable="true"
          @dragstart="onDragStart"
          :tag="`${index + 1}`"
          @click="toggleContextMenu"
          v-click-outside="hideContextMenu"
        />
        <BaseButton
          class="media-button"
          :class="{ hightlight: isAudioHightlight }"
          @click="toggleAudio"
          draggable="true"
          @dragstart="onDragStart"
        >
          <BaseIcon :name="audioIcon"></BaseIcon>
        </BaseButton>
        <BaseButton class="media-button" @click="toggleVideo">
          <BaseIcon :name="videoIcon"></BaseIcon>
        </BaseButton>
      </div>
      <StudentBadge class="badge" :badge="badge" @click="addABadge" />
      <div v-if="isContextMenuVisible" class="context-menu">
        <div>Context Menu</div>
      </div>
    </div>
    <div class="hasNotJoinned" v-if="isNotJoinned">
      Student has not been joined
    </div>
  </div>
</template>
<style lang="scss" scoped src="./student-card.scss"></style>
<script lang="ts" src="./student-card.ts"></script>