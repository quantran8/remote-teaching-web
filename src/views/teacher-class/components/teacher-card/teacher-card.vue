<template>
  <div>
    <div class="container">
      <div class="item-container">
        <div class="video" :id="id"></div>
        <div class="mask">
          <BaseTag class="tag" tag="T"></BaseTag>
          <div class="info">
<!--            <div class="name">{{ name }}</div>-->
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
        <div class="sound" @dragover="onDragOver" @drop="onDrop">
          <BaseButton mode="fill">
            <BaseIcon name="icon-audio-on"></BaseIcon>
          </BaseButton>
          <div class="content">
            <div
              class="student-audio"
              v-for="studentAudio in localAudios"
              :key="studentAudio.studentId"
            >
              <BaseTag :tag="studentAudio.tag" />
            </div>
          </div>
          <BaseButton
            mode="clear"
            @click="onClickClearAll"
            v-if="localAudios.length"
          >
            <BaseIcon class="close" name="icon-close" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./teacher-card.scss"></style>
<script lang="ts" src="./teacher-card.ts"></script>