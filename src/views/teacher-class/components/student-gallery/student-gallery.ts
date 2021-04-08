import { computed, defineComponent, watch } from "vue";
import { useStore } from "vuex";
import StudentAll from "./student-all/student-all.vue";
import StudentOne from "./student-one/student-one.vue";
import StudentControls from "./student-controls/student-controls.vue"

export default defineComponent({
  components: {
    StudentAll,
    StudentOne,
	StudentControls,
  },
  setup() {
    const { getters, dispatch } = useStore();
    const oneAndOneStatus = computed(
      () => getters["modeOne/getStudentModeOneId"]
    );

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

    return {
      oneAndOneStatus,
	  onClickHideAll,
	  onClickShowAll,
	  onClickMuteAll,
	  onClickUnmuteAll,
    };
  },
});