import { VCPlatform } from '@/store/app/state';
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import StudentAll from "./student-all/student-all.vue";
import StudentControls from "./student-controls/student-controls.vue";
import { fmtMsg } from "vue-glcommonui";
import { TeacherClassGallery } from "@/locales/localeid";
import moment from "moment";

const TIMESTAMP_ONEANDONE = "TIMESTAMP_ONEANDONE";

export default defineComponent({
  components: {
    StudentAll,
    StudentControls,
  },
  setup() {
    const { getters, dispatch } = useStore();
    const oneAndOneStatus = computed(() => getters["teacherRoom/getStudentModeOneId"]);
    const returnText = computed(() => fmtMsg(TeacherClassGallery.Return));

    const minute = ref(0);
    const second = ref(0);
    const timeCount = ref("");

    setInterval(() => {
      if (second.value < 60) {
        second.value = second.value + 1;
      } else {
        minute.value = minute.value + 1;
        second.value = 0;
      }
      timeCount.value = `${minute.value < 10 ? "0" + minute.value : minute.value}:${second.value < 10 ? "0" + second.value : second.value}`;
    }, 1000);

    watch(oneAndOneStatus, () => {
      if (!oneAndOneStatus.value) {
        sessionStorage.removeItem(TIMESTAMP_ONEANDONE);
        return;
      }

      const savedTimestampOneAndOne = parseInt(sessionStorage.getItem(TIMESTAMP_ONEANDONE) || Date.now().toString());
      sessionStorage.setItem(TIMESTAMP_ONEANDONE, savedTimestampOneAndOne.toString());

      const savedMoment = moment(savedTimestampOneAndOne);
      minute.value = moment(Date.now()).diff(savedMoment, "minute");
      second.value = moment(Date.now()).diff(savedMoment, "second");
      timeCount.value = "";
    });

    const onClickHideAll = async () => {
      await dispatch("teacherRoom/hideAllStudents");
    };

    const onClickShowAll = async () => {
      await dispatch("teacherRoom/showAllStudents");
    };

    const onClickMuteAll = async () => {
      await dispatch("teacherRoom/muteAllStudents");
    };

    const onClickUnmuteAll = async () => {
      await dispatch("teacherRoom/unmuteAllStudents");
    };

    const onClickStickerAll = async () => {
      await dispatch("teacherRoom/setAllStudentBadge");
    };

    const onClickDisableAll = async () => {
      await dispatch("teacherRoom/disableAllStudents");
    };

    const onClickEnableAll = async () => {
      await dispatch("teacherRoom/enableAllStudents");
    };

    const previousExposure = computed(() => getters["lesson/previousExposure"]);
    const previousExposureMediaItem = computed(() => getters["lesson/previousExposureItemMedia"]);
    
	const backToClass = async () => {
      if (previousExposure.value) {
        await dispatch("teacherRoom/setCurrentExposure", { id: previousExposure.value.id });
      }
      if (previousExposureMediaItem.value) {
        await dispatch("teacherRoom/setCurrentExposureMediaItem", { id: previousExposureMediaItem.value.id });
      }
      await dispatch("teacherRoom/clearStudentOneId", { id: "" });
	  await dispatch("teacherRoom/sendOneAndOne", {
        status: false,
        id: null,
      });
	  if(getters["platform"] === VCPlatform.Zoom){
	  	const roomManager = getters["teacherRoom/roomManager"];
		await roomManager?.zoomClient.teacherBackToMainRoom()
	  }
    };

    return {
      oneAndOneStatus,
      onClickHideAll,
      onClickShowAll,
      onClickMuteAll,
      onClickUnmuteAll,
      onClickStickerAll,
      onClickDisableAll,
      onClickEnableAll,
      timeCount,
      backToClass,
      returnText,
    };
  },
});
