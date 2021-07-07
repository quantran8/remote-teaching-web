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
  props: ["classIsActive", "unitInfo", "loading", "messageStartClass", "notJoin"],
  emits: ["go-to-class", "on-join-session"],
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
    const currentMicLabel = ref("");
    const currentCam = ref<DeviceType>();
    const currentCamLabel = ref("");
    const volumeByPercent = ref(0);
    const volumeAnimation = ref();
    const videoElementId = props.notJoin ? "pre-local-player-header" : "pre-local-player";
    const agoraError = ref(false);
    const setupDevice = async () => {
      const mics = await AgoraRTC.getMicrophones();
      if (mics) {
        currentMic.value = mics[0];
        currentMicLabel.value = mics[0]?.label;
        listMics.value = mics;
        listMicsId.value = mics.map(mic => mic.deviceId);
      }
      const cams = await AgoraRTC.getCameras();
      if (cams) {
        currentCam.value = cams[0];
        currentCamLabel.value = cams[0]?.label;
        listCams.value = cams;
        listCamsId.value = cams.map(cam => cam.deviceId);
      }
    };

    watch(
      isOpenMic,
      currentIsOpenMic => {
        if (!currentIsOpenMic) {
          dispatch("setMuteAudio", { status: MediaStatus.mediaLocked });
          localTracks.value?.audioTrack.setEnabled(false);
        }
        if (currentIsOpenMic) {
          dispatch("setMuteAudio", { status: MediaStatus.mediaNotLocked });
          localTracks.value?.audioTrack.setEnabled(true);
        }
      },
      { immediate: true },
    );

    watch(
      isOpenCam,
      currentIsOpenCamValue => {
        if (!currentIsOpenCamValue) {
          dispatch("setHideVideo", { status: MediaStatus.mediaLocked });
          localTracks.value?.videoTrack.setEnabled(false);
        }
        if (currentIsOpenCamValue) {
          dispatch("setHideVideo", { status: MediaStatus.mediaNotLocked });
          localTracks.value?.videoTrack.setEnabled(true);
        }
      },
      { immediate: true },
    );

    const initialSetup = async () => {
      try {
        const localTracksResult = await Promise.all([AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack()]);
        const [audioTrack, videoTrack] = localTracksResult;
        localTracks.value = {
          audioTrack,
          videoTrack,
        };
        setupDevice();
      } catch (error) {
        console.log("Initial setup have error => ", error);
        agoraError.value = true;
      }
    };

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
      localTracks.value?.videoTrack.setEnabled(false);
      localTracks.value?.audioTrack.setEnabled(false);
      localTracks.value?.audioTrack.close();
      localTracks.value?.videoTrack.close();
    };

    watch(visible, async currentValue => {
      if (!currentValue) {
        cancelAnimationFrame(volumeAnimation.value);
        destroy();
        return;
      }
      await initialSetup();
      volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
      setTimeout(() => {
        localTracks.value?.videoTrack.play(videoElementId);
      }, 0);
    });

    const goToClass = () => {
      emit("go-to-class");
    };

    const currentUnit = ref();
    const currentLesson = ref();

    watch(visible, currentVisible => {
      if (currentVisible) {
        const initUnit = props.unitInfo?.[0]?.unit;
        if (initUnit) {
          currentUnit.value = initUnit;
        }
      }
      if (!currentVisible) {
        agoraError.value = false;
      }
    });

    const listLessonByUnit = ref();
    watch(currentUnit, currentUnitValue => {
      const currentUnitIndex = props.unitInfo.findIndex((item: UnitAndLesson) => item.unit === currentUnitValue);
      currentLesson.value = props.unitInfo[currentUnitIndex]?.sequence?.[0];
      listLessonByUnit.value = props.unitInfo[currentUnitIndex]?.sequence;
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
    };
  },
});
