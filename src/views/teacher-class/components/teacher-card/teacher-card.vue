<template>
  <div :class="['tc-video', !isGalleryView && 'tc-video--small']">
    <figure class="tc-video__figure">
      <div class="tc-video__video" :id="id"></div>
    </figure>
    <div class="tc-action">
      <a href="javascript:void(0)" class="tc-action__item" @click="toggleAudio">
        <img :src="audioIcon" class="tc-action__icon" />
      </a>
      <a href="javascript:void(0)" class="tc-action__item" @click="toggleVideo">
        <img :src="videoIcon" class="tc-action__icon" />
      </a>
    </div>
    <!-- <div class="item-container">
      <div class="mask">
        <div class="info">
          <BaseButton class="media-button" @click="toggleAudio">
            <BaseIcon :name="audioIcon" />
          </BaseButton>
          <BaseButton class="media-button" @click="toggleVideo">
            <BaseIcon :name="videoIcon" />
          </BaseButton>
        </div>
      </div>
    </div> -->
    <!--      Temporary hide, do not delete-->
    <!--      <div class="setting" style="display: none">-->
    <!--        <div class="sound" @dragover="onDragOver" @drop="onDrop">-->
    <!--          <BaseButton mode="fill">-->
    <!--            <BaseIcon name="icon-audio-on"></BaseIcon>-->
    <!--          </BaseButton>-->
    <!--          <div class="content">-->
    <!--            <div-->
    <!--              class="student-audio"-->
    <!--              v-for="studentAudio in localAudios"-->
    <!--              :key="studentAudio.studentId"-->
    <!--            >-->
    <!--              <BaseTag :tag="studentAudio.tag" />-->
    <!--            </div>-->
    <!--          </div>-->
    <!--          <BaseButton-->
    <!--            mode="clear"-->
    <!--            @click="onClickClearAll"-->
    <!--            v-if="localAudios.length"-->
    <!--          >-->
    <!--            <BaseIcon class="close" name="icon-close" />-->
    <!--          </BaseButton>-->
    <!--        </div>-->
    <!--      </div>-->
  </div>
</template>
<style lang="scss" scoped src="./teacher-card.scss"></style>
<script lang="ts" src="./teacher-card.ts"></script>
