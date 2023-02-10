import { CaptureNotification, TeacherClassGallery } from "@/locales/localeid";
import { VCPlatform } from "@/store/app/state";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { SESSION_MAXIMUM_IMAGE } from "@/utils/constant";
import { notification } from "ant-design-vue";
import moment from "moment";
import { computed, defineComponent, ref, watch } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { useStore } from "vuex";
import StudentAll from "./student-all/student-all.vue";
import StudentControls from "./student-controls/student-controls.vue";

const TIMESTAMP_ONEANDONE = "TIMESTAMP_ONEANDONE";

export default defineComponent({
  components: {
    StudentAll,
    StudentControls,
  },
  setup() {
    const { getters, dispatch } = useStore();
    const oneAndOneStatus = computed(() => getters["teacherRoom/getStudentModeOneId"]);
    const students = computed<Array<StudentState>>(() => getters["teacherRoom/students"]);
    const returnText = computed(() => fmtMsg(TeacherClassGallery.Return));
    const enableAllStudentVideoText = computed(() => fmtMsg(CaptureNotification.EnableAllStudentVideo));
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
    const onClickCaptureAll = async () => {
      if (students.value.some((st) => !st.videoEnabled)) {
        notification.info({
          message: enableAllStudentVideoText.value,
        });
        return;
      }
      const studentsReachedMaximumImage = students.value
        .filter((st) => st.status === InClassStatus.JOINED && st.imageCapturedCount >= SESSION_MAXIMUM_IMAGE)
        ?.map((_st) => _st.englishName);
      if (studentsReachedMaximumImage.length) {
        notification.info({
          message: fmtMsg(CaptureNotification.StudentsReachedMaximum, { studentsName: studentsReachedMaximumImage.join(", ") }),
        });
      }
      await dispatch("teacherRoom/sendRequestCaptureImage", { isCaptureAll: true, studentId: "" });
      await dispatch("teacherRoom/setCaptureAll", true);
    };

    const backToClass = async () => {
      await dispatch("teacherRoom/clearStudentOneId", { id: "" });
      await dispatch("teacherRoom/sendOneAndOne", {
        status: false,
        id: null,
      });
      if (getters["platform"] === VCPlatform.Zoom) {
        const roomManager = getters["teacherRoom/roomManager"];
        await roomManager?.zoomClient.backToMainSession();
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
      onClickCaptureAll,
      timeCount,
      backToClass,
      returnText,
    };
  },
});
