<template>
  <div class="device-tester">
    <Modal v-model:visible="visible" title="System check" width="1000px" :footer="null">
      <div class="device-tester__modal">
        <div class="device-tester__camera">
          <div class="title">Camera</div>
          <div class="label" v-if="!isHide">Turn off</div>
          <div class="label" v-else>Turn on</div>
          <Switch v-model:checked="isHide" />
          <!-- <div v-if="!isHide">Move in front of the camera to check if it works.</div>
          <div v-else>Your camera was hided.</div> -->
          <div v-if="currentCam" class="device-tester__camera--select">
            <Select :disabled="isHide" v-model:value="currentCamLabel" style="width: 100%" ref="select" @change="handleCameraChange">
              <SelectOption v-for="deviceId in listCamsId" :key="deviceId" :value="deviceId">{{
                listCams.find(cam => cam.deviceId === deviceId)?.label
              }}</SelectOption>
            </Select>
          </div>
          <div ref="playerRef" id="pre-local-player" v-show="!isHide" :class="['device-tester__camera--player']"></div>
          <div v-show="isHide" :class="['device-tester__camera--player', 'hided']">
            <div class="device-tester__camera--player__icon">
              <img src="@/assets/video-off-white.svg" alt="" />
            </div>
            <div class="device-tester__camera--player__text">
              Your camera is turned off
            </div>
          </div>
        </div>
        <div class="device-tester__divider">
          <Divider type="vertical" style="height: 400px; background-color: #f0f0f0" />
        </div>
        <div class="device-tester__right">
          <div class="device-tester__right--micro">
            <div class="title">Microphone</div>
            <div class="label" v-if="!isMute">Turn off</div>
            <div class="label" v-else>Turn on</div>
            <Switch v-model:checked="isMute" />
            <!-- <div v-if="!isMute">Produce sounds to check if the mic works.</div>
          <div v-else>Your mic was muted.</div> -->
            <div v-if="currentMic" class="device-tester__right--micro__select">
              <Select :disabled="isMute" v-model:value="currentMicLabel" style="width: 100%" ref="select" @change="handleMicroChange">
                <SelectOption v-for="deviceId in listMicsId" :key="deviceId" :value="deviceId">{{
                  listMics.find(mic => mic.deviceId === deviceId)?.label
                }}</SelectOption>
              </Select>
            </div>
            <div v-else>
              <Skeleton active />
            </div>
            <Progress v-if="currentMic" :strokeWidth="25" :percent="isMute ? 0 : volumeByPercent" :show-info="false" />
          </div>
          <div class="device-tester__right--cl-status">
            <div v-if="isParent" class="device-tester__right--cl-status--student">
              <div>Class status</div>
              <div v-if="!classIsActive">No class in progress. We will notify you once the class starts</div>
              <div v-else>Class in progress. <span @click="goToClass" class="device-tester__right--cl-status--student__join">Join now</span></div>
            </div>
            <div v-if="isTeacher" class="device-tester__right--cl-status--teacher">
              <div class="title">Lesson & unit</div>
              <div v-if="unitInfo" class="device-tester__right--cl-status--teacher__content">
                <div class="device-tester__right--cl-status--teacher__content--item">
                  <div class="device-tester__right--cl-status--teacher__content--item__label">Unit</div>
                  <Select v-model:value="currentUnit" style="width: 100%" ref="select" @change="handleUnitChange">
                    <SelectOption v-for="item in unitInfo" :key="item.unit" :value="item.unit">{{ item.unit }}</SelectOption>
                  </Select>
                </div>
                <div class="device-tester__right--cl-status--teacher__content--item">
                  <div class="device-tester__right--cl-status--teacher__content--item__label">Lesson</div>
                  <Select v-model:value="currentLesson" style="width: 100%" ref="select" @change="handleLessonChange">
                    <SelectOption v-for="lesson in listLessonByUnit" :key="lesson" :value="lesson">{{ lesson }}</SelectOption>
                  </Select>
                </div>
              </div>
              <div class="device-tester__right--cl-status--teacher__button">
                <div class="device-tester__right--cl-status--teacher__button--1">
                  <Button width="100px" @click="handleCancel">Cancel</Button>
                </div>
                <Button width="100px" @click="handleSubmit" type="primary" :loading="loading">Join session</Button>
              </div>
              <div class="device-tester__right--cl-status--teacher__msg">
                {{ messageStartClass }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./device-tester.scss"></style>
<script lang="ts" src="./device-tester.ts"></script>
