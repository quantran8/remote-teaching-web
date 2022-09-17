import { defineComponent, computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { Modal, Switch, Select, Button, Skeleton, Divider, Row, Space, Spin, Checkbox, notification } from "ant-design-vue";
import { UnitAndLesson, MediaStatus, ClassRoomModel } from "@/models";
import { fmtMsg } from "vue-glcommonui";
import { DeviceTesterLocale, ChangeLessonUnitLocale, CommonLocale } from "@/locales/localeid";
import { getListUnitByClassAndGroup } from "@/views/teacher-home/lesson-helper";

export default defineComponent({
  components: {
    Modal,
    Switch,
    Select,
    SelectOption: Select.Option,
    Button,
    Skeleton,
    Divider,
    Row,
    Space,
    Spin,
    Checkbox,
  },
  emits: ["go-to-class", "on-join-session", "on-close-modal"],
  async created() {
    const { dispatch } = useStore();
    dispatch("setMuteAudio", { status: MediaStatus.mediaNotLocked });
    dispatch("setHideVideo", { status: MediaStatus.mediaNotLocked });
  },
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();
    const visible = ref(false);
    const currentUnit = ref();
    const loading = ref(false);
    const currentLesson = ref();
    const listLessonByUnit = ref();
    const preventCloseModal = ref(true);
    const loadingInfo = ref(false);
    const isComplete = ref(false);
    const messageUpdateLessonAndUnit = ref("");
    const unitInfo = ref<UnitAndLesson[]>();
    const classInfo = computed<ClassRoomModel>(() => getters["teacherRoom/info"]?.classInfo);
   
	const getListLessonByUnit = async () => {
      if (!classInfo.value) return;
      try {
        loadingInfo.value = true;
        unitInfo.value = await getListUnitByClassAndGroup(classInfo.value?.classId, classInfo.value?.groupId);
      } catch (err) {
        const message = err?.body?.message;
        if (message) {
          notification.error({
            message: message,
          });
        }
      }
      loadingInfo.value = false;
    };

    const initialSetup = async () => {
      getListLessonByUnit();
    };

    const showModal = () => {
      visible.value = true;
    };

    const destroy = async () => {
      currentUnit.value = null;
      currentLesson.value = null;
      messageUpdateLessonAndUnit.value = "";
    };

    watch(unitInfo, (currentValue) => {
      if (!currentValue) return;
      const unitDefault = classInfo.value?.unit;
      const currentUnitIndex = currentValue?.findIndex((item: UnitAndLesson) => item.unit === unitDefault);
      if (currentUnitIndex >= 0) {
        currentUnit.value = currentValue[currentUnitIndex].unit;
      } else {
        const initUnit = currentValue?.[0]?.unit;
        if (initUnit) {
          currentUnit.value = initUnit;
        }
      }
    });

    watch(currentUnit, (currentUnitValue) => {
      if (!unitInfo.value) return;
      const currentUnitIndex = unitInfo.value?.findIndex((item: UnitAndLesson) => item.unit === currentUnitValue);
      listLessonByUnit.value = unitInfo.value[currentUnitIndex]?.sequence;
      currentLesson.value = classInfo.value?.lesson;
    });

    watch(currentLesson, () => {
      messageUpdateLessonAndUnit.value = "";
    });

    watch(visible, async (currentValue) => {
      if (!currentValue) {
        await destroy();
        return;
      }
      await initialSetup();
    });

    const handleUnitChange = (unit: any) => {
      currentUnit.value = unit;
    };

    const handleLessonChange = (lesson: any) => {
      currentLesson.value = lesson;
    };

    const handleSubmit = async () => {
      loading.value = true;
      try {
        const unitId = unitInfo.value?.find((unit: UnitAndLesson) => unit.unit === currentUnit.value)?.unitId as number;
        await dispatch("teacherRoom/setLessonAndUnit", { unit: currentUnit.value, lesson: currentLesson.value, unitId, isComplete: isComplete.value });
        loading.value = false;
        handleCancel();
      } catch (error) {
        const message = error?.body?.message;
        if (message) {
          messageUpdateLessonAndUnit.value = message;
        }
      }
      loading.value = false;
    };

    const handleCancel = () => {
      visible.value = false;
    };

    const SetLessonAndUnit = computed(() => fmtMsg(ChangeLessonUnitLocale.SetLessonAndUnit));
    const LessonUnit = computed(() => fmtMsg(DeviceTesterLocale.LessonUnit));
    const Lesson = computed(() => fmtMsg(DeviceTesterLocale.Lesson));
    const Unit = computed(() => fmtMsg(DeviceTesterLocale.Unit));
    const Cancel = computed(() => fmtMsg(DeviceTesterLocale.Cancel));
    const Ok = computed(() => fmtMsg(ChangeLessonUnitLocale.Ok));
    const MarkCurrentLessonCompleteForClass = computed(() => fmtMsg(ChangeLessonUnitLocale.MarkCurrentLessonCompleteForClass));

    return {
      SetLessonAndUnit,
      LessonUnit,
      Lesson,
      Unit,
      Cancel,
      Ok,
      MarkCurrentLessonCompleteForClass,
      visible,
      showModal,
      currentUnit,
      currentLesson,
      listLessonByUnit,
      handleSubmit,
      handleCancel,
      preventCloseModal,
      handleUnitChange,
      handleLessonChange,
      unitInfo,
      messageUpdateLessonAndUnit,
      loading,
      classInfo,
      isComplete,
    };
  },
});
