<template>
  <div>
    <div class="container">
      <div class="item-container">
        <div class="video"></div>
        <div class="mask">
          <BaseTag class="tag" tag="T"></BaseTag>
          <div class="info">
            <div class="name">{{ name }}</div>
            <BaseButton class="media-button" @click="toggleAudio">
              <BaseIcon :name="audioIcon"></BaseIcon>
            </BaseButton>
            <BaseButton class="media-button" @click="toggleVideo">
              <BaseIcon :name="videoIcon"></BaseIcon>
            </BaseButton>
          
          </div>
        </div>
      </div>
      <div class="setting">
        <BaseButton class="button-setting" @click="toggleContextMenu">
          <BaseIcon class="icon-setting" name="icon-setting"></BaseIcon>
          <div v-if="contextMenuVisibility" class="context-menu">
            <BaseButton class="menu-item" @click="onClickHideAll">
              <BaseIcon name="icon-video-on" class="menu-icon"></BaseIcon>
              <div class="item-title">Hide All</div>
            </BaseButton>

            <BaseButton class="menu-item" @click="onClickMuteAll">
              <BaseIcon name="icon-audio-on" class="menu-icon"></BaseIcon>
              <div class="item-title">Mute All</div>
            </BaseButton>

            <div class="menu-item spacer"></div>
            <BaseButton class="menu-item" @click="onClickEnd">
              <BaseIcon name="icon-close" class="menu-icon"></BaseIcon>
              <div class="item-title">End</div>
            </BaseButton>
          </div>
        </BaseButton>

        <div class="sound">
          <BaseButton mode="fill">
            <BaseIcon name="icon-audio-on"></BaseIcon>
          </BaseButton>
          <div class="content"></div>
          <BaseButton mode="clear">
            <BaseIcon class="close" name="icon-close" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher-card.scss"></style>
<script lang="ts" src="./teacher-card.ts"></script>