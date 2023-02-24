<template>
  <div class="class_setup">
    <div class="class_setup_header">
      <p class="title_text title_text--lg">{{ dateTime }}</p>
    </div>
    <div class="class_setup_container">
      <div class="class_info">
        <div class="class_info_session">
          <p class="title_text title_text--lg">{{ schoolName }}</p>
          <p class="title_text title_text--md">{{ campusName }}</p>
          <p class="title_text title_text--md">{{ className }}</p>
          <p v-if="groupName" class="title_text title_text--md">{{ groupText }} {{ groupName }}</p>
        </div>
        <div v-if="isTeacherSetup" class="class_info_unit-lesson">
          <Row align="start">
            <div class="ant-col-24 ant-col-sm-18">
              <Space size="large" align="center">
                <Space size="small" align="center">
                  <label>{{ Unit }}</label>
                  <Select
                    style="min-width: 52px"
                    v-model:value="currentUnit"
                    class="device-tester__unit-lesson"
                    ref="select"
                    @change="handleUnitChange"
                  >
                    <SelectOption v-for="item in unitInfo" :key="item.unit" :value="item.unit">{{ item.unit }}</SelectOption>
                  </Select>
                </Space>
                <Space size="small" align="center">
                  <label>{{ Lesson }}</label>
                  <Select
                    style="min-width: 52px"
                    v-model:value="currentLesson"
                    class="device-tester__unit-lesson"
                    ref="select"
                    @change="handleLessonChange"
                    notFoundContent="No Data"
                  >
                    <SelectOption v-for="lesson in listLessonByUnit" :key="lesson" :value="lesson">{{ lesson }}</SelectOption>
                  </Select>
                </Space>
              </Space>
            </div>
          </Row>
        </div>
        <div v-if="isTeacherSetup" class="class_info_member">
          <div>
            <p class="title_text title_text--md">{{ classSetUpStudents.length }} {{ MembersText }}</p>
          </div>
          <div class="class_info_member_active">
            <P class="student_status">{{ ActiveStudentsText }} ({{ activeStudents.length }})</P>
            <div class="list_student">
              <p v-for="st in activeStudents" :key="st.studentId" class="list_student__name">
                {{ st.studentName }}
              </p>
            </div>
          </div>
          <div class="class_info_member_inactive">
            <P v-if="inActiveStudents.length" class="student_status">{{ InActiveStudentsText }} ({{ inActiveStudents.length }})</P>
            <div v-if="inActiveStudents.length" class="list_student list_student_inactive">
              <p v-for="st in inActiveStudents" :key="st.studentId" class="list_student__name">
                {{ st.studentName }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="device_setup">
        <div class="device-tester">
          <Row align="middle" class="device-tester__default">
            <p class="title_text title_text--md">{{ RemoteSetUpText }}</p>
          </Row>
          <div class="flex__container">
            <Row align="middle" class="device-tester__default">
              <div class="device-tester__default--lt">
                <img src="@/assets/icons/speaker.png" class="device-tester-icon" />
                <span> {{ CheckSpeaker }} </span>
              </div>
              <div class="device-tester__default--rt">
                <Space size="large" align="center" class="device-tester__check-mic-cam">
                  <div class="device-tester__speaker--icon">
                    <audio loop id="audio" style="display: none">
                      <source src="@/assets/audio/ConnectTestSound.mp3" type="audio/mp3" />
                    </audio>
                    <img :src="speakerIcon" @click="toggleSpeaker" alt="" class="sound-img" />
                  </div>
                  <Select
                    :placeholder="SelectDevice"
                    style="width: 330px"
                    :disabled="!isCheckSpeaker"
                    v-model:value="currentSpeakerLabel"
                    ref="select"
                    @change="handleSpeakerChange"
                  >
                    <SelectOption v-for="deviceId in listSpeakersId" :key="deviceId" :value="deviceId">
                      {{ listSpeakers.find((speaker) => speaker.deviceId === deviceId)?.label }}
                    </SelectOption>
                  </Select>
                </Space>
              </div>
            </Row>
            <img v-if="isPlayingSound" src="@/assets/images/audio-wave.gif" class="sound-img" />
          </div>
          <Row align="middle" class="alert-device-test">
            <p v-show="!havePermissionMicrophone">
              <span>{{ warningMsgMicrophone }}</span>
            </p>
          </Row>
          <Row align="middle" class="device-tester__default">
            <div class="device-tester__default--lt">
              <img src="@/assets/icons/mic.png" class="device-tester-icon" />
              <span>{{ CheckMic }}</span>
            </div>
            <div class="device-tester__default--rt">
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
          <Row align="middle" class="device-tester__default">
            <div class="device-tester__default--lt" />
            <div class="device-tester__default--rt" v-show="listMics.length > 0">
              <Progress :strokeWidth="25" :percent="!isOpenMic ? 0 : volumeByPercent" strokeColor="#5c2d91" :show-info="false" class="progress" />
            </div>
          </Row>
          <Row align="middle" class="alert-device-test">
            <p v-show="!havePermissionMicrophone">
              <span>{{ warningMsgMicrophone }}</span>
            </p>
          </Row>
          <Row align="middle" class="device-tester__default">
            <div class="device-tester__default--lt">
              <img src="@/assets/icons/videocam.png" class="device-tester-icon" />
              <span>{{ CheckCam }}</span>
            </div>
            <div class="device-tester__default--rt">
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
          <Row align="middle" class="alert-device-test">
            <p v-show="!havePermissionCamera">
              <span>{{ warningMsgCamera }}</span>
            </p>
          </Row>
          <Row v-if="isTeacherSetup" align="middle" class="device-tester__default">
            <div class="device-tester__default--lt">
              <img src="@/assets/icons/video-call.png" class="device-tester-icon" />
              <span>{{ PlatformText }}</span>
            </div>
            <div class="device-tester__default--rt">
              <Space size="large" align="center" class="device-tester__check-mic-cam">
                <Switch v-model:checked="isUsingAgora" />
                <div style="width: 330px">
                  <span v-if="!isUsingAgora" class="device-tester__mess-teacher-error">
                    {{ OneToOneNotification }}
                  </span>
                </div>
              </Space>
            </div>
          </Row>
          <Row align="middle" class="device-tester__default">
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
          </Row>
          <Row class="device-tester__default device-tester__mt device-tester__mb">
            <div class="device-tester__default--lt" />
            <div class="device-tester__default--rt">
              <Space size="large" align="center">
                <button @click="handleCancel" class="device-tester__cancel">
                  <span>{{ Cancel }}</span>
                </button>

                <button
                  v-if="isTeacherSetup"
                  @click="onJoinAsHelper"
                  :class="`device-tester__join_session_btn ${
                    isClassIncludingHelper ? 'device-tester__join_session_btn_disable' : 'device-tester__join_session_btn_active'
                  }`"
                  :disabled="isClassIncludingHelper"
                >
                  <div v-if="isWaitingTeacherConfirm">
                    <Spin :indicator="indicator" style="color: white" />
                  </div>
                  <div v-else>
                    <CheckOutlined style="padding-inline: 3px; font-size: 18px" />
                    <span>{{ JoinSessionAsHelperText }}</span>
                  </div>
                </button>
                <button
                  @click="handleSubmit"
                  :loading="loading"
                  :class="`device-tester__join_session_btn ${
                    isDisabledJoinBtn || (isTeacherSetup && isClassHappening)
                      ? 'device-tester__join_session_btn_disable'
                      : 'device-tester__join_session_btn_active'
                  }`"
                  :disabled="loading || isDisabledJoinBtn || (isTeacherSetup && isClassHappening)"
                >
                  <div v-if="loading">
                    <Spin :indicator="indicator" style="color: white" />
                  </div>
                  <div v-else>
                    <CheckOutlined style="padding-inline: 3px; font-size: 18px" />
                    <span>{{ isTeacherSetup ? StartSessionText : JoinSession }}</span>
                  </div>
                </button>
              </Space>
            </div>
          </Row>
          <Row type="flex" justify="left">
            <span class="device-tester__mess-teacher-error">{{ messageStartClass }}</span>
          </Row>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped src="./class-setup.scss"></style>
<script lang="ts" src="./class-setup.ts"></script>
