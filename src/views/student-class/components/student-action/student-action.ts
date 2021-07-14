import { MatIcon } from "@/commonui";
import { StudentState } from "@/store/room/interface";
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import IconHandRaised from "@/assets/student-class/hand-raised.png";
import IconHand from "@/assets/student-class/hand-jb.png";
import IconAudioOff from "@/assets/student-class/audio-off.svg";
import IconAudioOn from "@/assets/student-class/audio-on.svg";
import IconVideoOff from "@/assets/student-class/video-off.svg";
import IconVideoOn from "@/assets/student-class/video-on.svg";

const AUTO_TOGGLE_MICRO_TIMING = 10000; //10 seconds

export default defineComponent({
  props: {},
  components: {
    MatIcon,
  },
  setup: () => {
    const store = useStore();
    const router = useRouter();
    const student = computed<StudentState>(() => store.getters["studentRoom/student"]);
    const raisedHand = computed(() => (student.value?.raisingHand ? student.value?.raisingHand : false));
    const isToggleTime = ref(false);
    const onClickRaisingHand = async () => {
      await store.dispatch("studentRoom/studentRaisingHand", {});
    };

    const toggleAudio = async () => {
      await store.dispatch("studentRoom/setStudentAudio", {
        id: student.value.id,
        enable: !student.value.audioEnabled,
      });
    };

    const delay = () =>
      new Promise((res: any, rej) => {
        setTimeout(() => {
          res();
        }, 2000);
      });

    setTimeout(async () => {
      if (student.value.audioEnabled) {
        isToggleTime.value = true;
        await toggleAudio();
        await delay();
        await toggleAudio();
        isToggleTime.value = false;
      }
    }, AUTO_TOGGLE_MICRO_TIMING);

    const toggleVideo = async () => {
      await store.dispatch("studentRoom/setStudentVideo", {
        id: student.value.id,
        enable: !student.value.videoEnabled,
      });
    };

    return {
      student,
      onClickRaisingHand,
      IconHandRaised,
      IconHand,
      raisedHand,
      toggleAudio,
      IconAudioOn,
      IconAudioOff,
      toggleVideo,
      IconVideoOn,
      IconVideoOff,
      isToggleTime,
    };
  },
});
