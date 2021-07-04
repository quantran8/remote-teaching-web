<template>
  <div class="device-tester">
    <Modal v-model:visible="visible" title="System check" :footer="null">
      <div class="device-tester__micro">
        <h4>Microphone</h4>
        <h5>Turn off</h5>
        <Switch v-model:checked="isMute" />
        <h5 v-if="!isMute">Produce sounds to check if the mic works.</h5>
        <h5 v-else>Your mic was muted.</h5>
        <div v-if="currentMic" class="device-tester__micro--select">
          <Select :disabled="isMute" v-model:value="currentMicLabel" style="width: 100%" ref="select" @change="handleMicroChange">
            <SelectOption v-for="deviceId in listMicsId" :key="deviceId" :value="deviceId">{{
              listMics.find(mic => mic.deviceId === deviceId)?.label
            }}</SelectOption>
          </Select>
        </div>
        <Progress :strokeWidth="25" :percent="isMute ? 0 : volumeByPercent" :show-info="false" />
      </div>
      <div class="device-tester__camera">
        <h4>Camera</h4>
        <h5>Turn off</h5>
        <Switch v-model:checked="isHide" />
        <h5 v-if="!isHide">Move in front of the camera to check if it works.</h5>
        <h5 v-else>Your camera was hided.</h5>
        <div v-if="currentCam" class="device-tester__micro--select">
          <Select :disabled="isHide" v-model:value="currentCamLabel" style="width: 100%" ref="select" @change="handleCameraChange">
            <SelectOption v-for="deviceId in listCamsId" :key="deviceId" :value="deviceId">{{
              listCams.find(cam => cam.deviceId === deviceId)?.label
            }}</SelectOption>
          </Select>
        </div>
        <div ref="playerRef" id="pre-local-player" v-show="!isHide" :class="['device-tester__camera--player']"></div>
        <div ref="playerRef" id="pre-local-player" v-show="isHide" :class="['device-tester__camera--player', 'hided']"></div>
      </div>
      <div class="device-tester__cl-status">
        <div v-if="isParent" class="device-tester__cl-status--student">
          <h4>Class status</h4>
          <h5 v-if="!classIsActive">No class in progress. We will notify you once the class starts</h5>
          <h5 v-else>Class in progress. <span @click="goToClass" class="device-tester__cl-status--student__join">Join now</span></h5>
        </div>
        <div v-if="isTeacher" class="device-tester__cl-status--teacher">
          <h4>Lesson & unit</h4>
          <div v-if="unitInfo" class="device-tester__cl-status--teacher__content">
            <div class="device-tester__cl-status--teacher__content--item">
              <div class="device-tester__cl-status--teacher__content--item__label">Unit</div>
              <Select v-model:value="currentUnit" style="width: 100%" ref="select" @change="handleUnitChange">
                <SelectOption v-for="item in unitInfo" :key="item.unit" :value="item.unit">{{ item.unit }}</SelectOption>
              </Select>
            </div>
            <div class="device-tester__cl-status--teacher__content--item">
              <div class="device-tester__cl-status--teacher__content--item__label">Lesson</div>
              <Select v-model:value="currentLesson" style="width: 100%" ref="select" @change="handleLessonChange">
                <SelectOption v-for="lesson in listLessonByUnit" :key="lesson" :value="lesson">{{ lesson }}</SelectOption>
              </Select>
            </div>
          </div>
          <div class="device-tester__cl-status--teacher__button">
            <div class="device-tester__cl-status--teacher__button--1">
              <Button @click="handleCancel">Cancel</Button>
            </div>
            <Button @click="handleSubmit" type="primary">Join session</Button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./device-tester.scss"></style>
<script lang="ts" src="./device-tester.ts"></script>
