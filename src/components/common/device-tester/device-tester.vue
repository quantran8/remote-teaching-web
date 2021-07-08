<template>
  <div class="device-tester">
    <Modal
      :style="{ top: hasJoinAction ? '5%' : '10%' }"
      class="device-tester__modal"
      v-model:visible="visible"
      :title="SystemCheck"
      width="700px"
      :footer="null"
      :maskClosable="!preventCloseModal"
    >
      <div>
        <div class="device-tester__micro block-gutter">
          <div class="device-tester__micro--header">
            <div class="device-tester__micro--header__title">{{ CheckMic }}</div>
            <div class="device-tester__micro--header__select">
              <Select
                :placeholder="SelectDevice"
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
            <Switch v-model:checked="isOpenMic" />
          </div>
          <div class="device-tester__micro--progress">
            <div class="device-tester__micro--progress__wave">
              <Progress :strokeWidth="25" :percent="!isOpenMic ? 0 : volumeByPercent" :show-info="false" />
            </div>
          </div>
        </div>
        <div class="device-tester__camera block-gutter">
          <div class="device-tester__camera--header">
            <div class="device-tester__camera--header__title">{{ CheckCam }}</div>
            <div class="device-tester__camera--header__switch"><Switch v-model:checked="isOpenCam" /></div>
            <div class="device-tester__camera--header__select">
              <Select
                :placeholder="SelectDevice"
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
              {{ CamOff }}
            </div>
          </div>
        </div>
        <div v-if="hasJoinAction" class="device-tester__cl-status">
          <div v-if="isParent" class="device-tester__cl-status--student">
            <div class="device-tester__cl-status--student__title">{{ ClassStatus }}</div>
            <div v-if="!classIsActive">
              {{ getRoomInfoError ? getRoomInfoError : DefaultMessage1 }}
            </div>
            <div v-else>
              {{ DefaultMessage2 }}
              <span class="device-tester__cl-status--student__join"
                ><Button @click="goToClass" type="primary">{{ JoinNow }} </Button></span
              >
            </div>
          </div>
          <div v-if="isTeacher" class="device-tester__cl-status--teacher">
            <div class="title">{{ LessonUnit }}</div>
            <div v-if="unitInfo" class="device-tester__cl-status--teacher__content">
              <div class="device-tester__cl-status--teacher__content--item">
                <div class="device-tester__cl-status--teacher__content--item__label">{{ Unit }}</div>
                <Select v-model:value="currentUnit" style="width: 100%" ref="select" @change="handleUnitChange">
                  <SelectOption v-for="item in unitInfo" :key="item.unit" :value="item.unit">{{ item.unit }}</SelectOption>
                </Select>
              </div>
              <div class="device-tester__cl-status--teacher__content--item">
                <div class="device-tester__cl-status--teacher__content--item__label">{{ Lesson }}</div>
                <Select v-model:value="currentLesson" style="width: 100%" ref="select" @change="handleLessonChange">
                  <SelectOption v-for="lesson in listLessonByUnit" :key="lesson" :value="lesson">{{ lesson }}</SelectOption>
                </Select>
              </div>
            </div>
            <div class="device-tester__cl-status--teacher__button">
              <div class="device-tester__cl-status--teacher__button--1">
                <Button width="100px" @click="handleCancel">{{ Cancel }}</Button>
              </div>
              <Button :disabled="!currentMic || !isOpenMic" width="100px" @click="handleSubmit" type="primary" :loading="loading">{{
                JoinSession
              }}</Button>
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
