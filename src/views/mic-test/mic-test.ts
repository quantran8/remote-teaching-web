import { defineComponent, ref, onMounted, watch } from "vue";
import { Select, Spin, Modal, Button, Row, Empty } from "ant-design-vue";
import { TeacherClassModel, UnitAndLesson } from "@/models";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    isTeacher: Boolean,
    visible: Boolean,
    teacherClass: {
      type: Object as () => TeacherClassModel,
    },
    groupId: String,
    messageStartClass: String,
    unitInfo: {
      type: Object as () => UnitAndLesson[],
    },
    loading: Boolean,
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
    const lessons = ref<number[]>([]);
    const sequence = ref<number[]>([]);
    const selectedUnit = ref();
    const selectedLesson = ref();
    const resetWarningMessage = ref<string>();
    let updateInformation = false;

    watch(props, () => {
      if (props.loading == true){
        updateInformation = true;
      }
      if (!updateInformation) {
        if (props.unitInfo) {
          selectedUnit.value = props.unitInfo[0].unit;
          if (props.unitInfo[0].lesson[0]) {
            selectedLesson.value = props.unitInfo[0].lesson[0];
          } else {
            selectedLesson.value = "";
          }
          lessons.value = props.unitInfo[0].lesson;
          sequence.value = props.unitInfo[0].sequence;
        } else {
          selectedUnit.value = props.teacherClass?.unit;
          selectedLesson.value = "";
        }
      }
      if(props.messageStartClass){
        resetWarningMessage.value = props.messageStartClass;
      }
    });

    const handleChangeUnit = async (value: any) => {
      selectedLesson.value = "";
      selectedUnit.value = value;
      resetWarningMessage.value = "";
      const lessonInfo = props.unitInfo?.find((unitSelect: any) => {return unitSelect.unit == value})?.lesson;
      const sequenceInfo = props.unitInfo?.find((unitSelect: any) => {return unitSelect.unit == value})?.sequence;

      lessons.value = lessonInfo ? lessonInfo : [];
      sequence.value = sequenceInfo ? sequenceInfo : [];

      if (lessons.value) {
        selectedLesson.value = lessons.value[0];
      }
    };

    const handleChangeLesson = async (value: any) => {
      resetWarningMessage.value = "";
      selectedLesson.value = value;
    };

    const cancel = async () => {
      await emit("on-cancel");
    };

    const joinSession = async () => {
      let sequenceChosen = 0;
      lessons.value.map((les: number, index) => {
        if (les == selectedLesson.value) {
          sequenceChosen = sequence.value[index];
        }
      });
      await emit("on-join-session", { unit: selectedUnit.value, lesson: sequenceChosen });
    };

    return {
      cancel,
      joinSession,
      lessons,
      selectedUnit,
      selectedLesson,
      handleChangeUnit,
      handleChangeLesson,
      resetWarningMessage,
    };
  },
});
