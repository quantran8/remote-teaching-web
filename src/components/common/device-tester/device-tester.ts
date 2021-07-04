import { defineComponent, computed, ref, onMounted, watch } from "vue";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Modal, Switch, Progress, Select } from "ant-design-vue";

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
  },
  props: ["classIsActive"],
  emits: ["go-to-class"],
  setup(props, { emit }) {
    const visible = ref(false);
    const isMute = ref<boolean>(false);
    const isHide = ref<boolean>(false);
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
    onMounted(() => {
      initialSetup();
    });

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
        console.log("Error => ", error);
      }
    };

    const setVolumeWave = () => {
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

    watch(visible, currentValue => {
      if (!currentValue) {
        cancelAnimationFrame(volumeAnimation.value);
        return;
      }
      setupDevice();
      volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
      setTimeout(() => {
        localTracks.value?.videoTrack.play("pre-local-player");
      }, 0);
    });

    const goToClass = () => {
      emit("go-to-class");
    };

    return {
      visible,
      showModal,
      isMute,
      isHide,
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
	  goToClass
    };
  },
});
