import { TeacherClassLessonPlan } from "@/locales/localeid";
import { ExposureStatus, ExposureType } from "@/store/lesson/state";
import { getSeconds, secondsToTimeStr } from "@/utils/convertDuration";
import { computed, defineComponent } from "vue";
import { fmtMsg } from "vue-glcommonui";

const exposureIcon = (type: ExposureType) => {
  let icon = "icon-bigbook";
  switch (type) {
    case ExposureType.ACTIVITY:
      icon = "icon-bigbook";
      break;
    case ExposureType.POEM:
      icon = "icon-bigbook";
      break;
    case ExposureType.SONG:
      icon = "icon-song";
      break;
    case ExposureType.BIG_BOOK:
      icon = "icon-bigbook";
      break;
    case ExposureType.PHONOGRAM:
      icon = "icon-abc";
      break;
    case ExposureType.VIDEO:
      icon = "icon-video";
      break;
    case ExposureType.CHANT:
      icon = "icon-abc";
      break;
    case ExposureType.STORY:
      icon = "icon-bigbook";
      break;
    case ExposureType.VPC:
      icon = "icon-bigbook";
      break;
    case ExposureType.TRANSITION:
      icon = "icon-transitions";
      break;
  }
  return icon;
};

export default defineComponent({
  props: ["id", "title", "type", "duration", "status"],
  setup(props) {
    const activityIcon = exposureIcon(props.type);
    const isCompleted = computed(() => props.status === ExposureStatus.COMPLETED);
    const formattedDuration = computed(() => secondsToTimeStr(getSeconds(props.duration)));
    const exposureTitle = computed(() =>
      props.type === ExposureType.TRANSITION
        ? fmtMsg(TeacherClassLessonPlan.Transition)
        : props.type === ExposureType.COMPLETE
        ? fmtMsg(TeacherClassLessonPlan.LessonComplete)
        : props.title,
    );
    const isExposureLpComplete = computed(() => props.type === ExposureType.COMPLETE);
    return {
      activityIcon,
      isCompleted,
      formattedDuration,
      exposureTitle,
      isExposureLpComplete,
    };
  },
});
