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
      :closable="!preventCloseModal"
    >
      <Row align="middle" class="device-tester__mb--small">
        <div class="ant-col-24 ant-col-sm-6">
          <b>{{ CheckMic }}</b>
        </div>
        <div class="ant-col-24 ant-col-sm-18">
          <Space size="large" align="center" class="device-tester__check-mic-cam">
            <Switch v-model:checked="isOpenMic" />
            <Select
              :placeholder="SelectDevice"
              class=""
              style="width: 330px"
              :disabled="!isOpenMic"
              v-model:value="currentMicLabel"
              ref="select"
              @change="handleMicroChange"
            >
              <SelectOption v-for="deviceId in listMicsId" :key="deviceId" :value="deviceId">
                {{ listMics.find((mic) => mic.deviceId === deviceId)?.label }}
              </SelectOption>
            </Select>
          </Space>
        </div>
      </Row>
      <Row align="middle" class="device-tester__mb--default">
        <div class="ant-col-24 ant-col-sm-12 ant-col-sm-offset-6" v-show="listMics.length > 0">
          <Progress :strokeWidth="25" :percent="!isOpenMic ? 0 : volumeByPercent" :show-info="false" />
        </div>
        <p v-show="!havePermissionMicrophone">
          <span class="alert-device-test">{{ warningMsgMicrophone }}</span>
        </p>
      </Row>
      <Row align="middle" class="device-tester__mb--small">
        <div class="ant-col-24 ant-col-sm-6">
          <b>{{ CheckCam }}</b>
        </div>
        <div class="ant-col-24 ant-col-sm-18">
          <Space size="large" align="center" class="device-tester__check-mic-cam">
            <Switch v-model:checked="isOpenCam" />
            <Select
              :placeholder="SelectDevice"
              style="width: 330px"
              :disabled="!isOpenCam"
              v-model:value="currentCamLabel"
              ref="select"
              @change="handleCameraChange"
            >
              <SelectOption v-for="deviceId in listCamsId" :key="deviceId" :value="deviceId">
                {{ listCams.find((cam) => cam.deviceId === deviceId)?.label }}
              </SelectOption>
            </Select>
          </Space>
        </div>
      </Row>

      <Row v-if="showMirrorSwitch" align="middle" class="device-tester__mb--small">
        <div class="ant-col-24 ant-col-sm-6">
          <b>{{ TeacherVideoMirroring }}</b>
        </div>
        <div class="ant-col-24 ant-col-sm-18">
          <Space size="large" align="center" class="device-tester__check-mic-cam">
            <Switch v-model:checked="isTeacherVideoMirror" />
          </Space>
        </div>
      </Row>

      <Row v-if="showMirrorSwitch" align="middle" class="device-tester__mb--small">
        <div class="ant-col-24 ant-col-sm-6">
          <b>{{ StudentVideoMirroring }}</b>
        </div>
        <div class="ant-col-24 ant-col-sm-18">
          <Space size="large" align="center" class="device-tester__check-mic-cam">
            <Switch v-model:checked="isStudentVideoMirror" />
          </Space>
        </div>
      </Row>

      <Row align="middle" class="device-tester__mb--default">
        <p v-show="!havePermissionCamera">
          <span class="alert-device-test">{{ warningMsgCamera }}</span>
        </p>
      </Row>
      <Row align="middle" class="device-tester__mb--default">
        <div class="ant-col-24 ant-col-sm-12 ant-col-sm-offset-6">
          <video
            ref="playerRef"
            :id="videoElementId"
            v-show="isOpenCam && currentCam && !zoomCamError"
            v-if="!isUsingAgora"
            :class="['device-tester__camera--player']"
          ></video>
          <div
            ref="playerRef"
            :id="videoElementId"
            v-show="isOpenCam && currentCam && !agoraCamError"
            v-if="isUsingAgora"
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
      </Row>

      <!-- <Row v-if="showTeacherFooter" align="middle" class="device-tester__mb--small">
        <div class="ant-col-24 ant-col-sm-6">
          <b>{{ Platform }}</b>
        </div>
        <div class="ant-col-24 ant-col-sm-18">
          <Space size="large" align="center" class="device-tester__check-mic-cam">
            <Select v-model:value="currentPlatform" class="device-device-tester__platform" ref="select" :disabled="!isConfigTrackingDone">
              <SelectOption v-for="pl in listPlatform" :key="pl.key" :value="pl.key">{{ pl.name }}</SelectOption>
            </Select>
          </Space>
        </div>
      </Row> -->

      <Row v-if="showTeacherFooter" align="middle" class="device-tester__mb--default">
        <div class="ant-col-24 ant-col-sm-6">
          <b>{{ LessonUnit }}</b>
        </div>
        <div class="ant-col-24 ant-col-sm-18">
          <Space size="large" align="center">
            <Space size="small" align="center">
              <label>{{ Unit }}</label>
              <Select v-model:value="currentUnit" class="device-tester__unit-lesson" ref="select" @change="handleUnitChange">
                <SelectOption v-for="item in unitInfo" :key="item.unit" :value="item.unit">{{ item.unit }}</SelectOption>
              </Select>
            </Space>
            <Space size="small" align="center">
              <label>{{ Lesson }}</label>
              <Select v-model:value="currentLesson" class="device-tester__unit-lesson" ref="select" @change="handleLessonChange">
                <SelectOption v-for="lesson in listLessonByUnit" :key="lesson" :value="lesson">{{ lesson }}</SelectOption>
              </Select>
            </Space>
          </Space>
        </div>
      </Row>
      <Row v-if="showTeacherFooter" type="flex" justify="end" class="device-tester__mb--small">
        <Space size="large" align="center">
          <Button width="100px" @click="handleCancel">{{ Cancel }}</Button>
          <Button width="100px" @click="handleSubmit" type="primary" :loading="loading">
            {{ JoinSession }}
          </Button>
        </Space>
      </Row>
      <Row v-if="showTeacherFooter" type="flex" justify="center">
        <span class="device-tester__mess-teacher-error">{{ messageStartClass }}</span>
      </Row>
      <Row v-if="showParentFooter" align="middle" class="device-tester__mb--default">
        <div class="ant-col-24 ant-col-sm-6">
          <b>{{ ClassStatus }}</b>
        </div>
        <div class="ant-col-24 ant-col-sm-18">
          <span v-if="!classIsActive">
            {{ notDisplaySpinner ? getRoomInfoErrorByMsg : DefaultMessage1 }}
            <Spin v-if="!notDisplaySpinner"></Spin>
          </span>
          <span v-else>{{ DefaultMessage2 }}</span>
        </div>
      </Row>
      <Row v-if="showParentFooter" type="flex" justify="end">
        <Space size="large" align="center">
          <Button width="100px" @click="handleCancel">{{ Cancel }}</Button>
          <Button :disabled="!classIsActive" width="100px" @click="goToClass" type="primary" :loading="loading">
            {{ JoinNow }}
          </Button>
        </Space>
      </Row>
    </Modal>
  </div>
</template>
<style lang="scss" scoped src="./device-tester.scss"></style>
<script lang="ts" src="./device-tester.ts"></script>