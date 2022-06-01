import { defineComponent, computed, ref, watch, onUnmounted } from "vue";
import AgoraRTC from "agora-rtc-sdk-ng";
import ZoomVideo, { LocalAudioTrack, LocalVideoTrack } from "@zoom/videosdk";

import { useStore } from "vuex";
import { Modal, Switch, Progress, Select, Button, Skeleton, Divider, Row, Space, Spin } from "ant-design-vue";
import { UnitAndLesson, MediaStatus } from "@/models";
import { fmtMsg } from "vue-glcommonui";
import { DeviceTesterLocale } from "@/locales/localeid";
import { Logger } from "@/utils/logger";
import { VCPlatform } from "@/store/app/state";
interface DeviceType {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
}

export default defineComponent({
  components: {
    Modal,
    Switch,
    Progress,
    Select,
    SelectOption: Select.Option,
    Button,
    Skeleton,
    Divider,
    Row,
    Space,
    Spin,
  },
  props: [
    "classIsActive",
    "unitInfo",
    "loading",
    "messageStartClass",
    "notJoin",
    "getRoomInfoError",
    "infoStart",
    "fromParentComponent",
    "getRoomInfoErrorByMsg",
  ],
  emits: ["go-to-class", "on-join-session", "on-close-modal"],
  async created() {
    const { dispatch } = useStore();
    dispatch("setMuteAudio", { status: MediaStatus.mediaNotLocked });
    dispatch("setHideVideo", { status: MediaStatus.mediaNotLocked });
  },
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();
    const isTeacher = computed(() => getters["auth/isTeacher"]);
    const isParent = computed(() => getters["auth/isParent"]);
    const visible = ref(false);
    const isOpenMic = ref<boolean>(true);
    const isOpenCam = ref<boolean>(true);
    const platform = computed(() => getters["platform"]);
    const localTracks = ref<any>(null);
    const listMics = ref<DeviceType[]>([]);
    const listMicsId = ref<string[]>([]);
    const listCams = ref<DeviceType[]>([]);
    const listCamsId = ref<string[]>([]);
    const playerRef = ref();
    const currentMic = ref<DeviceType>();
    const currentMicLabel = ref();
    const currentCam = ref<DeviceType>();
    const currentCamLabel = ref();
    const volumeByPercent = ref(0);
    const volumeAnimation = ref();
    const videoElementId = props.notJoin ? "pre-local-player-header" : "pre-local-player";
    const agoraError = ref(false);
    const agoraMicError = ref(false);
    const agoraCamError = ref(false);
    const zoomMicError = ref(false);
    const zoomCamError = ref(false);
    const firstTimeDefault = ref(true);
    const currentUnit = ref();
    const currentPlatform = ref<number>(platform.value);
    const isUsingAgora = ref<boolean>(platform.value === VCPlatform.Agora);
    const currentLesson = ref();
    const listLessonByUnit = ref();
    const preventCloseModal = ref(true);
    const havePermissionCamera = ref(true);
    const havePermissionMicrophone = ref(true);
    const devices = ref<MediaDeviceInfo[]>([]);

    const listPlatform = [
      { key: VCPlatform.Agora, name: VCPlatform[1] },
      { key: VCPlatform.Zoom, name: VCPlatform[2] },
    ];

    const setupAgora = async () => {
      let audioTrack = null;
      let videoTrack = null;
      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        havePermissionCamera.value = true;
      } catch (error) {
        Logger.log("setupAgora error when create videoTrack =>", error);
        if (error?.code === "PERMISSION_DENIED") havePermissionCamera.value = false;
        preventCloseModal.value = false;
        agoraCamError.value = true;
      }
      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        havePermissionMicrophone.value = true;
      } catch (error) {
        Logger.log("setupAgora error when create audioTrack =>", error);
        if (error?.code === "PERMISSION_DENIED") havePermissionMicrophone.value = false;
        preventCloseModal.value = false;
        agoraMicError.value = true;
      }
      localTracks.value = {
        audioTrack,
        videoTrack,
      };
    };

    const setupZoom = async () => {
      let audioTrack: LocalAudioTrack | null = null;
      let videoTrack: LocalVideoTrack | null = null;
      try {
        devices.value = await ZoomVideo.getDevices();
      } catch (error) {
        devices.value = await ZoomVideo.getDevices(true);
      }
      try {
        const cams = devices.value.filter(function (device) {
          return device.kind === "videoinput";
        });
        if (cams.length) {
          currentCam.value = cams[0];
          currentCamLabel.value = cams[0]?.label;
          listCams.value = cams;
          listCamsId.value = cams.map((cam) => cam.deviceId);
          videoTrack = ZoomVideo.createLocalVideoTrack(cams[0].deviceId);
          havePermissionCamera.value = true;
        }
      } catch (error) {
        Logger.log("SetupZoom error when create videoTrack =>", error);
        if (error?.code === "PERMISSION_DENIED") havePermissionCamera.value = false;
        preventCloseModal.value = false;
        zoomCamError.value = true;
      }
      try {
        const mics = devices.value.filter(function (device) {
          return device.kind === "audioinput";
        });
        if (mics.length) {
          currentMic.value = mics[0];
          currentMicLabel.value = mics[0]?.label;
          listMics.value = mics;
          listMicsId.value = mics.map((mic) => mic.deviceId);
          audioTrack = ZoomVideo.createLocalAudioTrack(mics[0].deviceId);
          havePermissionMicrophone.value = true;
        }
      } catch (error) {
        Logger.log("SetupZoom error when create audioTrack =>", error);
        if (error?.code === "PERMISSION_DENIED") havePermissionMicrophone.value = false;
        preventCloseModal.value = false;
        zoomMicError.value = true;
      }
      localTracks.value = {
        audioTrack,
        videoTrack,
      };
    };

    let isConfigZoomTrackingDone = false;
    const setupZoomTracking = async () => {
      try {
        const doc = document.getElementById(videoElementId) as HTMLVideoElement;
        await localTracks.value?.videoTrack?.start(doc);
		
        await localTracks.value?.audioTrack?.start();
        await localTracks.value?.audioTrack.unmute();

        if (!volumeAnimation.value) {
          volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
        }
        isConfigZoomTrackingDone = true;
        preventCloseModal.value = false;
      } catch (error) {
        Logger.log("Setup Zoom tracking failed");
        preventCloseModal.value = false;
        Logger.log(error);
      }
    };

    const setupDevice = async () => {
      try {
        const cams = await AgoraRTC.getCameras();
        if (cams.length) {
          currentCam.value = cams[0];
          currentCamLabel.value = cams[0]?.label;

          listCams.value = cams;
          listCamsId.value = cams.map((cam) => cam.deviceId);
          await localTracks.value.videoTrack.setDevice(cams[0]?.deviceId);
          try {
            await localTracks.value?.videoTrack.play(videoElementId);
            preventCloseModal.value = false;
          } catch (error) {
            preventCloseModal.value = false;
            Logger.log("Error when play video => ", error);
          }
        } else {
          preventCloseModal.value = false;
        }
      } catch (error) {
        Logger.log("setupCam error => ", error);
        agoraCamError.value = true;
      }
      try {
        const mics = await AgoraRTC.getMicrophones();
        if (mics.length) {
          currentMic.value = mics[0];
          currentMicLabel.value = mics[0]?.label;

          listMics.value = mics;
          listMicsId.value = mics.map((mic) => mic.deviceId);
          await localTracks.value?.audioTrack.setDevice(mics[0]?.deviceId);
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      } catch (error) {
        Logger.log("setupMic error => ", error);
        agoraMicError.value = true;
      }
    };

    const setupUnitAndLesson = () => {
      const unitDefault = props.infoStart.teacherClass.unit;
      const currentUnitIndex = props.unitInfo.findIndex((item: UnitAndLesson) => item.unit === unitDefault);
      if (currentUnitIndex >= 0) {
        currentUnit.value = props.unitInfo[currentUnitIndex].unit;
      } else {
        const initUnit = props.unitInfo?.[0]?.unit;
        if (initUnit) {
          currentUnit.value = initUnit;
        }
      }
    };

    const handleHotPluggingMicro = async (newMicroId?: string) => {
      try {
        const mics = await AgoraRTC.getMicrophones();
        if (mics.length) {
          currentMic.value = mics[0];
          currentMicLabel.value = mics[0]?.label;
          listMics.value = mics;
          listMicsId.value = mics.map((mic) => mic.deviceId);
          if (newMicroId) {
            await localTracks.value?.audioTrack.setDevice(newMicroId);
          } else {
            await localTracks.value?.audioTrack.setDevice(mics[0]?.deviceId);
          }
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      } catch (error) {
        Logger.log("setupMic error => ", error);
        agoraMicError.value = true;
      }
    };

    const handleHotPluggingCamera = async (newCameraId?: string) => {
      try {
        const cams = await AgoraRTC.getCameras();
        if (cams.length) {
          currentCam.value = cams[0];
          currentCamLabel.value = cams[0]?.label;
          listCams.value = cams;
          listCamsId.value = cams.map((cam) => cam.deviceId);
          await localTracks.value.videoTrack.setDevice(newCameraId || cams[0]?.deviceId);
          try {
            await localTracks.value?.videoTrack.play(videoElementId);
            preventCloseModal.value = false;
          } catch (error) {
            preventCloseModal.value = false;
            Logger.log("Error when play video => ", error);
          }
        } else {
          currentCamLabel.value = cams[0]?.label;
          listCams.value = cams;
          listCamsId.value = cams.map((cam) => cam.deviceId);
          preventCloseModal.value = false;
        }
      } catch (error) {
        Logger.log("setupCam error => ", error);
        agoraCamError.value = true;
      }
    };

    const onHotMicroPluggingDevice = async (changedDevice: any) => {
      if (changedDevice.state === "ACTIVE") {
        await handleHotPluggingMicro(changedDevice.device.deviceId);
      } else {
        await handleHotPluggingMicro();
      }
    };
    const onHotCameraPluggingDevice = async (changedDevice: any) => {
      if (changedDevice.state === "ACTIVE") {
        await handleHotPluggingCamera(changedDevice.device.deviceId);
      } else {
        await handleHotPluggingCamera();
      }
    };

    const setupEvent = () => {
      AgoraRTC.onMicrophoneChanged = onHotMicroPluggingDevice;
      AgoraRTC.onCameraChanged = onHotCameraPluggingDevice;
    };

    const cancelVolumeAnimation = () => {
      cancelAnimationFrame(volumeAnimation.value);
      volumeAnimation.value = null;
      volumeByPercent.value = 0;
    };

    const initialSetup = async () => {
      if (!props.notJoin && !props.fromParentComponent) {
        setupUnitAndLesson();
      }
      if (isUsingAgora.value) {
        await setupAgora();
        await setupDevice();
        setupEvent();
      } else {
        await setupZoom();
        await setupZoomTracking();
      }
    };

    watch(currentMic, async (currentMicValue) => {
      if (!isConfigZoomTrackingDone) return;
      if (!localTracks.value?.audioTrack) return;
      if (currentMicValue) {
        if (isUsingAgora.value) {
          await localTracks.value?.audioTrack.setEnabled(true);
        } else {
          const thisMic = listMics.value.find(({ deviceId }) => deviceId === currentMicValue.deviceId) || listMics.value[0];
          await localTracks.value?.audioTrack.stop();
          localTracks.value["audioTrack"] = ZoomVideo.createLocalAudioTrack(thisMic.deviceId);
          await localTracks.value?.audioTrack.start();
          if (isOpenMic.value) {
            await localTracks.value?.audioTrack.unmute();
          }
        }
        if (!volumeAnimation.value) {
          volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
        }
      }
    });

    watch(currentCam, async (currentCamValue) => {
      if (!isConfigZoomTrackingDone) return;
      if (!localTracks.value?.videoTrack) return;
      if (currentCamValue) {
        if (isUsingAgora.value) {
          await localTracks.value?.videoTrack.play(videoElementId);
          await localTracks.value?.videoTrack.setEnabled(true);
        } else {
          const thisCam = listCams.value.find(({ deviceId }) => deviceId === currentCamValue.deviceId) || listCams.value[0];
          await localTracks.value?.videoTrack.stop();
          localTracks.value["videoTrack"] = ZoomVideo.createLocalVideoTrack(thisCam.deviceId);
          if (isOpenCam.value) {
            const doc = document.getElementById(videoElementId) as HTMLVideoElement;
            await localTracks.value?.videoTrack.start(doc);
          }
        }
      }
    });

    //handle for camera
    watch(isOpenCam, async (currentIsOpenCamValue) => {
      if (currentIsOpenCamValue) {
        dispatch("setHideVideo", { status: MediaStatus.mediaNotLocked });
        if (currentCam.value) {
          if (isUsingAgora.value) {
            await localTracks.value?.videoTrack.setEnabled(true);
          } else {
            const doc = document.getElementById(videoElementId) as HTMLVideoElement;
            await localTracks.value?.videoTrack.start(doc);
          }
        }
      }
      if (!currentIsOpenCamValue) {
        dispatch("setHideVideo", { status: MediaStatus.mediaLocked });
        if (currentCam.value) {
          if (isUsingAgora.value) {
            await localTracks.value?.videoTrack.setEnabled(false);
          } else {
            await localTracks.value?.videoTrack.stop();
          }
        }
      }
    });

    //handle for microphone
    watch(isOpenMic, async (currentIsOpenMic) => {
      if (currentIsOpenMic) {
        dispatch("setMuteAudio", { status: MediaStatus.mediaNotLocked });
        if (currentMic.value) {
          if (isUsingAgora.value) {
            await localTracks.value?.audioTrack?.setEnabled(true);
          } else {
            await localTracks.value?.audioTrack?.unmute();
          }
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      }
      if (!currentIsOpenMic) {
        dispatch("setMuteAudio", { status: MediaStatus.mediaLocked });
        if (volumeAnimation.value) {
          cancelVolumeAnimation();
        }
        if (currentMic.value) {
          if (isUsingAgora.value) {
            await localTracks.value?.audioTrack.setEnabled(false);
          } else {
            await localTracks.value?.audioTrack.mute();
          }
        }
      }
    });

    const setVolumeWave = () => {
      if (!localTracks.value) return;
      volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
      volumeByPercent.value = isUsingAgora.value
        ? localTracks.value?.audioTrack.getVolumeLevel() * 100
        : localTracks.value?.audioTrack.getCurrentVolume() * 100;
    };

    const showModal = () => {
      visible.value = true;
    };

    const handleMicroChange = async (micId: string) => {
      try {
        if (isUsingAgora.value) {
          await localTracks.value?.audioTrack.setDevice(micId);
        }
        currentMic.value = listMics.value.find((mic) => mic.deviceId === micId);
      } catch (error) {
        Logger.log("Error => ", error);
      }
    };

    const handleCameraChange = async (camId: any) => {
      try {
        if (isUsingAgora.value) {
          await localTracks.value.videoTrack.setDevice(camId);
        }
        currentCam.value = listCams.value.find((cam) => cam.deviceId === camId);
      } catch (error) {
        Logger.log("Error => ", error);
      }
    };

    const destroySDK = async (isAgora: boolean) => {
      if (volumeAnimation.value) {
        cancelVolumeAnimation();
      }
      if (currentMic.value) {
        await localTracks.value?.audioTrack?.stop();
        if (isAgora) {
          await localTracks.value?.audioTrack?.close();
        }
      }
      if (currentCam.value) {
        await localTracks.value?.videoTrack?.stop();
        if (isAgora) {
          await localTracks.value?.videoTrack?.close();
          AgoraRTC.onCameraChanged = undefined;
          AgoraRTC.onMicrophoneChanged = undefined;

		  agoraError.value = false;
		  agoraCamError.value = false;
		  agoraMicError.value = false;
        }
      }
	  localTracks.value = undefined;
	  currentMic.value = undefined;
      currentCam.value = undefined;
	  isOpenMic.value = true;
      isOpenCam.value = true;
	  volumeAnimation.value = undefined;
      isConfigZoomTrackingDone = false;
	  
      Logger.log("Destroy SDK");
    };

    const destroy = async () => {
      await destroySDK(isUsingAgora.value);
      isConfigZoomTrackingDone = false;

      preventCloseModal.value = true;
      if (props.notJoin || props.fromParentComponent) return;
      currentUnit.value = null;
      currentLesson.value = null;
      firstTimeDefault.value = true;
    };

    watch(visible, async (currentValue) => {
      if (!currentValue) {
        await destroy();
        return;
      }
      await initialSetup();
    });

    const goToClass = () => {
      emit("go-to-class");
    };

    const handleGoToClassSuccess = () => {
      dispatch("setCameraDeviceId", currentCam.value?.deviceId ?? "");
      dispatch("setMicrophoneDeviceId", currentMic.value?.deviceId ?? "");
      if (isUsingAgora.value) {
        localTracks.value?.audioTrack?.close();
        localTracks.value?.videoTrack?.close();
      } else {
        localTracks.value?.audioTrack?.stop();
        localTracks.value?.videoTrack?.stop();
      }
    };

    watch(currentUnit, (currentUnitValue) => {
      if (props.notJoin || props.fromParentComponent) return;
      const currentUnitIndex = props.unitInfo.findIndex((item: UnitAndLesson) => item.unit === currentUnitValue);
      const availableLessons = props.unitInfo[currentUnitIndex]?.sequence;

      const currentLessonValue = props.infoStart.teacherClass.lessonNumber;
      const currentLessonIndex = availableLessons?.findIndex((item: number) => item === currentLessonValue);

      // find next lesson by next number bigger than current lesson\
      let nextLessonIndex = availableLessons?.findIndex((item: number) => item > currentLessonValue);

      // find any lesson bigger then current lesson, leave it as max lesson
      nextLessonIndex = nextLessonIndex < 0 ? Math.max(currentLessonIndex, availableLessons.length - 1) : nextLessonIndex;

      listLessonByUnit.value = props.unitInfo[currentUnitIndex]?.sequence;
      if (currentUnit.value === props.infoStart.teacherClass.unit && nextLessonIndex >= 0 && firstTimeDefault.value) {
        firstTimeDefault.value = false;
        currentLesson.value = props.unitInfo[currentUnitIndex]?.sequence?.[nextLessonIndex];
      } else {
        currentLesson.value = props.unitInfo[currentUnitIndex]?.sequence?.[0];
      }
    });

    const handleUnitChange = (unit: any) => {
      currentUnit.value = unit;
    };

    const handleLessonChange = (lesson: any) => {
      currentLesson.value = lesson;
    };

    const handleSubmit = () => {
      const unitId = props.unitInfo.find((unit: UnitAndLesson) => unit.unit === currentUnit.value).unitId;
      if (!unitId) return;
      emit("on-join-session", { unitId, lesson: currentLesson.value, unit: currentUnit.value });
    };
    const handleCancel = () => {
      visible.value = false;
    };

    watch(currentPlatform, async (currentValue) => {
      isUsingAgora.value = currentValue === VCPlatform.Agora;

      await destroySDK(!isUsingAgora.value);

      Logger.log("Platform changed");
      dispatch("setVideoCallPlatform", currentValue);
      await initialSetup();
    });

    const hasJoinAction = computed(() => !props.notJoin);
    const SystemCheck = computed(() => fmtMsg(DeviceTesterLocale.SystemCheck));
    const CheckMic = computed(() => fmtMsg(DeviceTesterLocale.CheckMic));
    const SelectDevice = computed(() => fmtMsg(DeviceTesterLocale.SelectDevice));
    const CheckCam = computed(() => fmtMsg(DeviceTesterLocale.CheckCam));
    const Platform = computed(() => fmtMsg(DeviceTesterLocale.Platform));
    const CamOff = computed(() => fmtMsg(DeviceTesterLocale.CamOff));
    const ClassStatus = computed(() => fmtMsg(DeviceTesterLocale.ClassStatus));
    const DefaultMessage1 = computed(() => fmtMsg(DeviceTesterLocale.DefaultMessage1));
    const DefaultMessage2 = computed(() => fmtMsg(DeviceTesterLocale.DefaultMessage2));
    const JoinNow = computed(() => fmtMsg(DeviceTesterLocale.JoinNow));
    const LessonUnit = computed(() => fmtMsg(DeviceTesterLocale.LessonUnit));
    const Lesson = computed(() => fmtMsg(DeviceTesterLocale.Lesson));
    const Unit = computed(() => fmtMsg(DeviceTesterLocale.Unit));
    const Cancel = computed(() => fmtMsg(DeviceTesterLocale.Cancel));
    const JoinSession = computed(() => fmtMsg(DeviceTesterLocale.JoinSession));
    const warningMsgMicrophone = computed(() => fmtMsg(DeviceTesterLocale.MessageWarningMic));
    const warningMsgCamera = computed(() => fmtMsg(DeviceTesterLocale.MessageWarningCamera));

    onUnmounted(() => {
      AgoraRTC.onMicrophoneChanged = undefined;
      AgoraRTC.onCameraChanged = undefined;
    });

    const showTeacherFooter = computed(() => hasJoinAction.value && isTeacher.value && !props.fromParentComponent);
    const showParentFooter = computed(() => hasJoinAction.value && isParent.value && props.fromParentComponent);

    const notDisplaySpinner = computed(() => props.getRoomInfoError !== 0);

    watch(visible, (currentVisibleValue) => {
      if (!currentVisibleValue) {
        emit("on-close-modal");
      }
    });

    return {
      warningMsgMicrophone,
      warningMsgCamera,
      havePermissionCamera,
      havePermissionMicrophone,
      SystemCheck,
      CheckMic,
      SelectDevice,
      CheckCam,
      Platform,
      CamOff,
      ClassStatus,
      DefaultMessage1,
      DefaultMessage2,
      JoinNow,
      LessonUnit,
      Lesson,
      Unit,
      Cancel,
      JoinSession,
      visible,
      showModal,
      isOpenMic,
      isOpenCam,
      playerRef,
      volumeByPercent,
      listMics,
      listCams,
      listCamsId,
      listMicsId,
      currentMic,
      currentCam,
      currentMicLabel,
      currentCamLabel,
      handleMicroChange,
      handleCameraChange,
      goToClass,
      isTeacher,
      isParent,
      currentUnit,
      currentLesson,
      handleUnitChange,
      handleLessonChange,
      listLessonByUnit,
      handleSubmit,
      handleCancel,
      hasJoinAction,
      videoElementId,
      agoraError,
      agoraCamError,
      agoraMicError,
      zoomMicError,
      zoomCamError,
      handleGoToClassSuccess,
      preventCloseModal,
      showTeacherFooter,
      showParentFooter,
      notDisplaySpinner,
      isUsingAgora,
      currentPlatform,
      listPlatform,
    };
  },
});
