<template>
  <div class="device-tester">
    <Modal
      :style="{ top: hasJoinAction ? '5%' : '10%' }"
      class="device-tester__modal"
      v-model:visible="visible"
      title="System check"
      width="700px"
      :footer="null"
    >
      <div>
        <div class="device-tester__micro block-gutter">
          <div class="device-tester__micro--header">
            <div class="device-tester__micro--header__title">Check Microphone</div>
            <div class="device-tester__micro--header__select">
              <Select
                placeholder="Select a Device"
                class=""
                style="width: 330px"
                :disabled="!isOpenMic"
                v-model:value="currentMicLabel"
                ref="select"
                @change="handleMicroChange"
              >
                <SelectOption v-for="deviceId in listMicsId" :key="deviceId" :value="deviceId">{{
                  listMics.find(mic => mic.deviceId === deviceId)?.label
                }}</SelectOption>
              </Select>
            </div>
          </div>
          <div class="device-tester__micro--switch">
            <span class="device-tester__micro--switch__text" v-if="isOpenMic">Mute</span>
            <span class="device-tester__micro--switch__text" v-else>Unmute</span>
            <Switch v-model:checked="isOpenMic" />
          </div>
          <div class="device-tester__micro--progress">
            <div class="device-tester__micro--progress__title">Mic Test</div>
            <div class="device-tester__micro--progress__wave">
              <Progress :strokeWidth="25" :percent="!isOpenMic ? 0 : volumeByPercent" :show-info="false" />
            </div>
          </div>
        </div>
        <div class="device-tester__camera block-gutter">
          <div class="device-tester__camera--header">
            <div class="device-tester__camera--header__title">Check Camera</div>
            <div class="device-tester__camera--header__select">
              <Select
                placeholder="Select a Device"
                style="width: 330px"
                :disabled="!isOpenCam"
                v-model:value="currentCamLabel"
                ref="select"
                @change="handleCameraChange"
              >
                <SelectOption v-for="deviceId in listCamsId" :key="deviceId" :value="deviceId">{{
                  listCams.find(cam => cam.deviceId === deviceId)?.label
                }}</SelectOption>
              </Select>
            </div>
          </div>
          <div class="device-tester__camera--switch">
            <!-- <span class="device-tester__camera--switch__text" v-if="isOpenCam">Hide</span>
            <span class="device-tester__camera--switch__text" v-else>Unhide</span> -->
            <Switch v-model:checked="isOpenCam" />
          </div>
          <div
            ref="playerRef"
            :id="videoElementId"
            v-show="isOpenCam && currentCam && !agoraCamError"
            :class="['device-tester__camera--player']"
          ></div>
          <div v-show="!isOpenCam || agoraCamError || !currentCam" :class="['device-tester__camera--player', 'hided']">
            <div class="device-tester__camera--player__icon">
              <img src="@/assets/video-off-white.svg" alt="" />
            </div>
            <div class="device-tester__camera--player__text">
              Your camera is turned off
            </div>
          </div>
        </div>
        <div v-if="hasJoinAction" class="device-tester__cl-status">
          <div v-if="isParent" class="device-tester__cl-status--student">
            <div class="title">Class status</div>
            <div v-if="!classIsActive">No class in progress. We will notify you once the class starts</div>
            <div v-else>Class in progress. <span @click="goToClass" class="device-tester__cl-status--student__join">Join now</span></div>
          </div>
          <div v-if="isTeacher" class="device-tester__cl-status--teacher">
            <div class="title">Lesson & unit</div>
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
                <Button width="100px" @click="handleCancel">Cancel</Button>
              </div>
              <Button width="100px" @click="handleSubmit" type="primary" :loading="loading">Join session</Button>
            </div>
            <div class="device-tester__cl-status--teacher__msg">
              {{ messageStartClass }}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./device-tester.scss"></style>
<script lang="ts" src="./device-tester.ts"></script>
