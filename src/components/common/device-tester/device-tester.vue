<template>
  <div class="device-tester">
    <Modal v-model:visible="visible" title="System check" :footer="null">
      <div class="device-tester__micro">
        <!-- <h5>Mute</h5>
        <Switch v-model:checked="checked" /> -->
        <h4>Microphone</h4>
        <h5>Produce sounds to check if the mic works.</h5>
        <div v-if="currentMic" class="device-tester__micro--select">
          <Select v-model:value="currentMicLabel" style="width: 100%" ref="select" @change="handleMicroChange">
            <SelectOption v-for="deviceId in listMicsId" :key="deviceId" :value="deviceId">{{
              listMics.find(mic => mic.deviceId === deviceId)?.label
            }}</SelectOption>
          </Select>
        </div>
        <Progress :strokeWidth="25" :percent="volumeByPercent" :show-info="false" />
      </div>
      <div class="device-tester__camera">
        <h4>Camera</h4>
        <h5>Move in front of the camera to check if it works.</h5>
        <div v-if="currentMic" class="device-tester__micro--select">
          <Select v-model:value="currentCamLabel" style="width: 100%" ref="select" @change="handleCameraChange">
            <SelectOption v-for="deviceId in listCamsId" :key="deviceId" :value="deviceId">{{
              listCams.find(cam => cam.deviceId === deviceId)?.label
            }}</SelectOption>
          </Select>
        </div>
        <div ref="playerRef" id="pre-local-player" class="device-tester__camera--player"></div>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./device-tester.scss"></style>
<script lang="ts" src="./device-tester.ts"></script>
