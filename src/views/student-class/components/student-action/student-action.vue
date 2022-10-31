<template>
  <div class="sc-action">
    <a href="javascript:void(0)" class="sc-action__item" @click="onClickRaisingHand">
      <img v-show="raisedHand" :src="IconHandRaised" class="sc-action__icon sc-action__icon--hand" />
      <img v-show="!raisedHand" :src="IconHand" class="sc-action__icon sc-action__icon--hand" />
    </a>
    <a href="javascript:void(0)" class="sc-action__item" @click="toggleAudio">
      <img v-show="student?.audioEnabled" :src="IconAudioOn" class="sc-action__icon" />
      <img v-show="!student?.audioEnabled" :src="IconAudioOff" :class="myTeacherDisconnected ? 'sc-action__icon sc-action__icon__disable' : 'sc-action__icon' " />
    </a>
    <a href="javascript:void(0)" class="sc-action__item" @click="toggleVideo">
      <img v-show="student?.videoEnabled" :src="IconVideoOn" class="sc-action__icon" />
      <img v-show="!student?.videoEnabled" :src="IconVideoOff" class="sc-action__icon" />
    </a>
  </div>
</template>
<script lang="ts" src="./student-action.ts"></script>
<style lang="scss" scoped src="./student-action.scss"></style>
