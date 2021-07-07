import { defineComponent, computed, ref, onMounted, watch } from "vue";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useStore } from "vuex";
import { Modal, Switch, Progress, Select, Button, Skeleton, Divider } from "ant-design-vue";
import { UnitAndLesson, MediaStatus } from "@/models";
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
  props: ["classIsActive", "unitInfo", "loading", "messageStartClass", "notJoin", "getRoomInfoError"],
  emits: ["go-to-class", "on-join-session"],
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();
    const isTeacher = computed(() => getters["auth/isTeacher"]);
    const isParent = computed(() => getters["auth/isParent"]);
    const visible = ref(false);
    const isOpenMic = ref<boolean>(false);
    const isOpenCam = ref<boolean>(false);
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
    const currentUnit = ref();
    const currentLesson = ref();
    const listLessonByUnit = ref();

    const setupAgora = async () => {
      let audioTrack = null;
      let videoTrack = null;
      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        audioTrack.setEnabled(false);
      } catch (error) {
        agoraMicError.value = true;
      }
      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        videoTrack.setEnabled(false);
      } catch (error) {
        agoraCamError.value = true;
      }
      localTracks.value = {
        audioTrack,
        videoTrack,
      };
    };

    const setupDevice = async () => {
      const mics = await AgoraRTC.getMicrophones();
      if (mics) {
        currentMic.value = undefined;
        currentMicLabel.value = undefined;
        listMics.value = mics;
        listMicsId.value = mics.map(mic => mic.deviceId);
      }
      const cams = await AgoraRTC.getCameras();
      if (cams) {
        currentCam.value = undefined;
        currentCamLabel.value = undefined;
        listCams.value = cams;
        listCamsId.value = cams.map(cam => cam.deviceId);
      }
    };

    const setupUnitAndLesson = () => {
      const initUnit = props.unitInfo?.[0]?.unit;
      if (initUnit) {
        currentUnit.value = initUnit;
      }
    };

    const cancelVolumeAnimation = () => {
      cancelAnimationFrame(volumeAnimation.value);
      volumeAnimation.value = null;
      volumeByPercent.value = 0;
    };

    const initialSetup = async () => {
      setupAgora();
      setupDevice();
      setupUnitAndLesson();
      dispatch("setHideVideo", { status: MediaStatus.mediaLocked });
      dispatch("setMuteAudio", { status: MediaStatus.mediaLocked });
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
        await localTracks.value?.videoTrack.play(videoElementId);
        await localTracks.value?.videoTrack.setEnabled(true);
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
      localTracks.value?.audioTrack.close();
      localTracks.value?.videoTrack.close();
      currentMic.value = undefined;
      currentCam.value = undefined;
      agoraError.value = false;
      agoraCamError.value = false;
      agoraMicError.value = false;
      isOpenMic.value = false;
      isOpenCam.value = false;
      volumeAnimation.value = undefined;
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
      localTracks.value?.audioTrack.close();
      localTracks.value?.videoTrack.close();
    };

    watch(currentUnit, currentUnitValue => {
      const currentUnitIndex = props.unitInfo.findIndex((item: UnitAndLesson) => item.unit === currentUnitValue);
      currentLesson.value = props.unitInfo[currentUnitIndex]?.lesson?.[0];
      listLessonByUnit.value = props.unitInfo[currentUnitIndex]?.lesson;
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

    return {
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
    };
  },
});
