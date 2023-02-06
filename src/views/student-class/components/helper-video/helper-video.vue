<template>
  <div v-if="helperInfo">
    <vue-final-modal
      v-model="showed"
      :content-class="[MODAL_CONTENT]"
      :drag="true"
      :click-to-close="false"
      :min-width="150"
      :min-height="100"
      :hide-overlay="true"
      :prevent-click="true"
    >
      <div class="content">
        <div class="content__video" :id="helperInfo?.id"></div>
        <div class="content__info">{{ helperInfo?.name }}</div>
        <custom-spinner />
      </div>
    </vue-final-modal>
  </div>
</template>
<script lang="ts" src="./helper-video.ts"></script>
<style lang="scss">
.helper-vfm-modal-content {
  width: 300px;
  height: 180px;
  box-shadow: 0px 0px 7px rgba(112, 112, 112, 0.45);
  transition: box-shadow 0.5s, transform 0.25s;
  border-radius: 5px;
  overflow: hidden;
  &:hover {
    box-shadow: 0px 0px 12px rgba(112, 112, 112, 0.45);
  }
  .content {
    cursor: move;
    position: relative;
    width: 100%;
    height: 100%;
    background: #222222;
    display: flex;
    justify-content: center;
    align-items: center;
    &__video {
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      position: absolute;
    }
    &__info {
      position: absolute;
      top: 5px;
      right: 5px;
      color: white;
      font-weight: bold;
      left: 5px;
      font-style: oblique;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      z-index: 2;
    }
  }
  .final-modal {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 75vh;
    &__content {
      padding: 10px 20px;
      width: 100%;
      height: 100%;
      overflow: auto;
      &:hover {
        // prevent text selection when move the modal
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    }
  }
}
</style>
