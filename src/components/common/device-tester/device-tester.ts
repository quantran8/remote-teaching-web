import { defineComponent, computed, ref, onMounted, watch } from "vue";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Modal, Switch, Progress, Select } from "ant-design-vue";
export default defineComponent({
  components: {
    Modal,
    Switch,
    Progress,
    Select,
    SelectOption: Select.Option,
  },
  setup() {
    const localTracks = ref<any>(null);
    const isBrowserAskingPermission = ref(false);
    const mics = ref([]);
    const visible = ref(false);
    const checked = ref<boolean>(false);
    const playerRef = ref();
    const currentMic = ref(null);
    const currentCam = ref(null);
    const volumeByPercent = ref(0);
    const volumeAnimation = ref();
    onMounted(() => {
      initialSetup();
    });

    const initialSetup = async () => {
      const localTracksResult = await Promise.all([AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack()]);
      const [audioTrack, videoTrack] = localTracksResult;
      localTracks.value = {
        audioTrack,
        videoTrack,
      };
    };
    const setVolumeWave = () => {
      volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
      volumeByPercent.value = localTracks.value.audioTrack.getVolumeLevel() * 100;
    };

    const handleOk = (e: MouseEvent) => {
      visible.value = false;
    };
    const showModal = () => {
      visible.value = true;
    };

    const focus = () => {
      console.log("focus");
    };

    const handleChange = (value: string) => {
      console.log(`selected ${value}`);
    };

    watch(visible, currentValue => {
      if (!currentValue) {
        cancelAnimationFrame(volumeAnimation.value);
        return;
      }
      volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
      setTimeout(() => {
        localTracks.value?.videoTrack.play("pre-local-player");
      }, 0);
    });

    return {
      visible,
      handleOk,
      showModal,
      checked,
      playerRef,
      volumeByPercent,
      focus,
      handleChange,
      value1: ref("lucy"),
      value2: ref("lucy"),
      value3: ref("lucy"),
    };
  },
});
