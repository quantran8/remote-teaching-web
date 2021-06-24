import { defineComponent, ref, onMounted, watch } from "vue";
import { Select, Spin, Modal, Button, Row, Empty } from "ant-design-vue";
import { TeacherClassModel } from "@/models";
import { useStore } from "vuex";
import { RemoteTeachingService } from "@/services";

export default defineComponent({
  props: {
    isTeacher: Boolean,
    visible: Boolean,
    teacherClass: {
      type: Object as () => TeacherClassModel,
    },
    groupId: String,
  },
  components: {
    Select,
    Spin,
    Option: Select.Option,
    Modal,
    Button,
    Row,
    Empty,
  },
  emits: ["on-join-session", "on-cancel"],
  setup(props, { emit }) {
    const store = useStore();
    const units = ref<{ id: number; number: number }[]>([]);
    const lessons = ref<{ id: number; number: number }[]>([]);
    const selectedUnit = ref();
    const selectedLesson = ref();

    onMounted(async () => {
      const dummyUnit = [];
      for (let i = 14; i <= 40; i++) {
        dummyUnit.push({ id: i, number: i });
      }
      units.value = dummyUnit;
    });

    watch(props, () => {
      if (props.teacherClass && props.groupId) {
        selectedUnit.value = 14;
        getListLessonByUnit(props.teacherClass, props.groupId, selectedUnit.value);
      }
    });

    const getListLessonByUnit = async (teacherClass: TeacherClassModel, groupId: string, unit: number) => {
      try {
        const response = await RemoteTeachingService.getListLessonByUnit(teacherClass.classId, groupId, unit);
        if (response && response.success) {
          if (response.data.length > 0) {
            lessons.value = response.data.map((lesson: any) => {
              return { id: lesson.sequence, number: lesson.sequence };
            });
            selectedLesson.value = lessons.value[0].number;
          } else {
            lessons.value = [];
            selectedLesson.value = null;
          }
        }
      } catch (err) {
        const message = err.body.message;
        if (message) {
          await store.dispatch("setToast", { message: message });
        }
      }
    };

    const handleChangeUnit = async (value: any) => {
      selectedUnit.value = value;
      if (props.teacherClass && props.groupId) {
        getListLessonByUnit(props.teacherClass, props.groupId, value);
      }
    };

    const handleChangeLesson = async (value: any) => {
      selectedLesson.value = value;
    };

    const cancel = async () => {
      emit("on-cancel");
    };

    const joinSession = async () => {
      emit("on-join-session", { unit: selectedUnit.value, lesson: selectedLesson.value });
    };

    return {
      cancel,
      joinSession,
      units,
      lessons,
      selectedUnit,
      selectedLesson,
      handleChangeUnit,
      handleChangeLesson,
    };
  },
});
