import { defineComponent, computed, ref, onMounted, watch } from "vue";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useStore } from "vuex";
import { Modal, Switch, Progress, Select, Button, Skeleton, Divider } from "ant-design-vue";
import { UnitAndLesson, MediaStatus } from "@/models";
import { fmtMsg } from "@/commonui";
import { DeviceTesterLocale } from "@/locales/localeid";

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
  emits: ["go-to-class", "on-join-session"],
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
    const localTracks = ref<any>(null);
    const isBrowserAskingPermission = ref(false);
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
    const firstTimeDefault = ref(true);
    const currentUnit = ref();
    const currentLesson = ref();
    const listLessonByUnit = ref();
    const preventCloseModal = ref(true);
    const setupAgora = async () => {
      let audioTrack = null;
      let videoTrack = null;
      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
      } catch (error) {
        console.log("setupAgora error when create videoTrack =>", error);
        preventCloseModal.value = false;
        agoraCamError.value = true;
      }
      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      } catch (error) {
        console.log("setupAgora error when create audioTrack =>", error);
        preventCloseModal.value = false;
        agoraMicError.value = true;
      }
      localTracks.value = {
        audioTrack,
        videoTrack,
      };
    };

    const setupDevice = async () => {
      try {
        const cams = await AgoraRTC.getCameras();
        if (cams.length) {
          currentCam.value = cams[0];
          currentCamLabel.value = cams[0]?.label;
          listCams.value = cams;
          listCamsId.value = cams.map(cam => cam.deviceId);
          await localTracks.value.videoTrack.setDevice(cams[0]?.deviceId);
          try {
            await localTracks.value?.videoTrack.play(videoElementId);
            preventCloseModal.value = false;
          } catch (error) {
            preventCloseModal.value = false;
            console.log("Error when play video => ", error);
          }
        } else {
          preventCloseModal.value = false;
        }
      } catch (error) {
        console.log("setupCam error => ", error);
        agoraCamError.value = true;
      }
      try {
        const mics = await AgoraRTC.getMicrophones();
        if (mics.length) {
          currentMic.value = mics[0];
          currentMicLabel.value = mics[0]?.label;
          listMics.value = mics;
          listMicsId.value = mics.map(mic => mic.deviceId);
          await localTracks.value.audioTrack.setDevice(mics[0]?.deviceId);
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      } catch (error) {
        console.log("setupMic error => ", error);
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
          listMicsId.value = mics.map(mic => mic.deviceId);
          if (newMicroId) {
            await localTracks.value.audioTrack.setDevice(newMicroId);
          } else {
            await localTracks.value.audioTrack.setDevice(mics[0]?.deviceId);
          }
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      } catch (error) {
        console.log("setupMic error => ", error);
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
          listCamsId.value = cams.map(cam => cam.deviceId);
          if (newCameraId) {
            await localTracks.value.videoTrack.setDevice(newCameraId);
          } else {
            await localTracks.value.videoTrack.setDevice(cams[0]?.deviceId);
          }
          try {
            await localTracks.value?.videoTrack.play(videoElementId);
            preventCloseModal.value = false;
          } catch (error) {
            preventCloseModal.value = false;
            console.log("Error when play video => ", error);
          }
        } else {
          currentCamLabel.value = cams[0]?.label;
          listCams.value = cams;
          listCamsId.value = cams.map(cam => cam.deviceId);
          preventCloseModal.value = false;
        }
      } catch (error) {
        console.log("setupCam error => ", error);
        agoraCamError.value = true;
      }
    };

    const onHotMicroPluggingDevice = async (changedDevice: any) => {
      if (changedDevice.state === "ACTIVE") {
        await handleHotPluggingMicro(changedDevice.device.deviceId);
      } else if (changedDevice.device.label === localTracks.value.audioTrack?.getTrackLabel()) {
        await handleHotPluggingMicro();
      }
    };
    const onHotCameraPluggingDevice = async (changedDevice: any) => {
      if (changedDevice.state === "ACTIVE") {
        await handleHotPluggingCamera(changedDevice.device.deviceId);
      } else if (changedDevice.device.label === localTracks.value.videoTrack?.getTrackLabel()) {
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
      await setupAgora();
      await setupDevice();
      setupEvent();
    };

    //handle for microphone
    watch(isOpenMic, currentIsOpenMic => {
      if (currentIsOpenMic) {
        dispatch("setMuteAudio", { status: MediaStatus.mediaNotLocked });
        if (currentMic.value) {
          localTracks.value?.audioTrack.setEnabled(true);
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
          localTracks.value?.audioTrack.setEnabled(false);
        }
      }
    });
    watch(currentMic, currentMicValue => {
      if (currentMicValue) {
        localTracks.value?.audioTrack.setEnabled(true);
        if (!volumeAnimation.value) {
          volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
        }
      }
    });

    //handle for camera
    watch(isOpenCam, async currentIsOpenCamValue => {
      if (currentIsOpenCamValue) {
        dispatch("setHideVideo", { status: MediaStatus.mediaNotLocked });
        if (currentCam.value) {
          await localTracks.value?.videoTrack.setEnabled(true);
        }
      }
      if (!currentIsOpenCamValue) {
        dispatch("setHideVideo", { status: MediaStatus.mediaLocked });
        if (currentCam.value) {
          localTracks.value?.videoTrack.setEnabled(false);
        }
      }
    });

    watch(currentCam, async currentCamValue => {
      if (currentCamValue) {
        await localTracks.value?.videoTrack?.play(videoElementId);
        await localTracks.value?.videoTrack?.setEnabled(true);
      }
    });

    const setVolumeWave = () => {
      if (!localTracks.value) return;
      volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
      volumeByPercent.value = localTracks.value.audioTrack.getVolumeLevel() * 100;
    };

    const showModal = () => {
      visible.value = true;
    };

    const handleMicroChange = async (micId: string) => {
      try {
        await localTracks.value.audioTrack.setDevice(micId);
        currentMic.value = listMics.value.find(mic => mic.deviceId === micId);
      } catch (error) {
        console.log("Error => ", error);
      }
    };

    const handleCameraChange = async (camId: any) => {
      try {
        await localTracks.value.videoTrack.setDevice(camId);
        currentCam.value = listCams.value.find(cam => cam.deviceId === camId);
      } catch (error) {
        console.log("Error => ", error);
      }
    };

    const destroy = () => {
      if (volumeAnimation.value) {
        cancelVolumeAnimation();
      }
      if (currentMic.value) {
        localTracks.value?.audioTrack?.stop();
        localTracks.value?.audioTrack?.close();
      }
      if (currentCam.value) {
        localTracks.value?.videoTrack?.stop();
        localTracks.value?.videoTrack?.close();
      }
      currentMic.value = undefined;
      currentCam.value = undefined;
      agoraError.value = false;
      agoraCamError.value = false;
      agoraMicError.value = false;
      isOpenMic.value = true;
      isOpenCam.value = true;
      volumeAnimation.value = undefined;
      preventCloseModal.value = true;
      if (props.notJoin || props.fromParentComponent) return;
      currentUnit.value = null;
      currentLesson.value = null;
      firstTimeDefault.value = true;
    };

    watch(visible, async currentValue => {
      if (!currentValue) {
        destroy();
        return;
      }
      await initialSetup();
    });

    const goToClass = () => {
      emit("go-to-class");
    };

    const handleGoToClassSuccess = () => {
      localTracks.value?.audioTrack?.close();
      localTracks.value?.videoTrack?.close();
    };

    watch(currentUnit, currentUnitValue => {
      if (props.notJoin || props.fromParentComponent) return;
      const currentUnitIndex = props.unitInfo.findIndex((item: UnitAndLesson) => item.unit === currentUnitValue);
      const currentLessonIndex = props.unitInfo[currentUnitIndex]?.sequence?.findIndex(
        (item: number) => item === props.infoStart.teacherClass.lessonNumber,
      );

      listLessonByUnit.value = props.unitInfo[currentUnitIndex]?.sequence;
      if (currentUnit.value === props.infoStart.teacherClass.unit && currentLessonIndex >= 0 && firstTimeDefault.value) {
        firstTimeDefault.value = false;
        currentLesson.value = props.unitInfo[currentUnitIndex]?.sequence?.[currentLessonIndex];
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
      emit("on-join-session", { unit: currentUnit.value, lesson: currentLesson.value });
    };
    const handleCancel = () => {
      visible.value = false;
    };

    const hasJoinAction = computed(() => !props.notJoin);
    const SystemCheck = computed(() => fmtMsg(DeviceTesterLocale.SystemCheck));
    const CheckMic = computed(() => fmtMsg(DeviceTesterLocale.CheckMic));
    const SelectDevice = computed(() => fmtMsg(DeviceTesterLocale.SelectDevice));
    const CheckCam = computed(() => fmtMsg(DeviceTesterLocale.CheckCam));
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

    return {
      SystemCheck,
      CheckMic,
      SelectDevice,
      CheckCam,
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
      handleGoToClassSuccess,
      preventCloseModal,
    };
  },
});
