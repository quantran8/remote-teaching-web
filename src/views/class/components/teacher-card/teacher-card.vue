<template>
  <div>
    <div class="container">
      <div class="item-container">
        <div class="video"></div>
        <div class="mask">
          <BaseTag class="tag" tag="T"></BaseTag>
          <div class="info">
            <div class="name">{{ name }}</div>
            <BaseIconButton
              class="icon"
              :icon="audioIcon"
              @click="toggleAudio"
            />
            <BaseIconButton
              class="icon"
              :icon="videoIcon"
              @click="toggleVideo"
            />
          </div>
        </div>
      </div>
      <div class="setting">
        <div class="icon-setting"></div>
        <div class="sound">
          <BaseIconButton class="icon" icon="icon-audio-on" />
          <div class="content"></div>
          <div class="close">x</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher-card.scss"></style>
<script lang="ts" src="./teacher-card.ts"></script>