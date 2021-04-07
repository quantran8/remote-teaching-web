import { StudentState, TeacherState } from "@/store/room/interface";
import { computed, ComputedRef, defineComponent, watch } from "vue";
import { useStore } from "vuex";
import { InteractiveStatus } from "../student-card/student-card";
import StudentCard from "../student-card/student-card.vue";
interface StudentViewModel extends StudentState {
  interactive: {
    correct: number;
    status: InteractiveStatus;
    multiAssign: boolean;
  };
}
export default defineComponent({
  components: {
    StudentCard,
  },
  setup() {
    const store = useStore();
    const students: ComputedRef<Array<StudentState>> = computed(
      () => store.getters["teacherRoom/students"]
    );
    const studentOneAndOneId = computed(
      () => store.getters["modeOne/getStudentModeOneId"]
    );
    const teacher: ComputedRef<TeacherState> = computed(
      () => store.getters["teacherRoom/teacher"]
    );
    const studentOne = students.value.filter(student => { return student.id === studentOneAndOneId.value })[0];

    const setVideoAudioStudent = async (audioStatus: boolean, videoStatus: boolean, id: string) => {
      await store.dispatch("teacherRoom/setStudentAudio", {
        id: id,
        enable: audioStatus,
      });
      await store.dispatch("teacherRoom/setStudentVideo", {
        id: id,
        enable: videoStatus,
      });
    }

    const setDefaultVideoStudent = () => {
      students.value.map(student => {
        if (student.id !== studentOneAndOneId.value) {
          setVideoAudioStudent(false, true, student.id);
        }
      })
    }

    const toggleVideoAudioTeacher = async (audioStatus: boolean, videoStatus: boolean, id: string) => {
      await store.dispatch("teacherRoom/setTeacherAudio", {
        id: id,
        enable: audioStatus,
      });
      await store.dispatch("teacherRoom/setTeacherVideo", {
        id: id,
        enable: videoStatus,
      });
    }

    const setVideoTeacher = async () => {
      if (!teacher.value) {
        return;
      }
      const teacherInfo = teacher.value;
      if (teacherInfo.audioEnabled && teacherInfo.videoEnabled){
        await toggleVideoAudioTeacher(false, false, teacherInfo.id);
        await toggleVideoAudioTeacher(true, true, teacherInfo.id);
      } else {
        await toggleVideoAudioTeacher(true, true, teacherInfo.id);
      }
    }

    let turnOnCurrentStudent = false;
    watch(studentOne, async () => {
      if (turnOnCurrentStudent) {
        return;
      }
      if (studentOne && studentOne.audioEnabled && studentOne.videoEnabled){
        await setVideoAudioStudent(false, false, studentOne.id);
        setTimeout(async () => {
          await setVideoAudioStudent(true, true, studentOne.id);
        },300)
        turnOnCurrentStudent = true;
      } else {
        turnOnCurrentStudent = false;
      }
    })

    setDefaultVideoStudent();
    setVideoTeacher();

    const backToClass = async () => {
      await setVideoTeacher();
      await store.dispatch("modeOne/clearStudentOneId", { id: '' });
      await store.dispatch("teacherRoom/sendOneAndOne", {
        status: false,
        id: null,
      });
    };

    return {
      backToClass,
      studentOne
    };
  },
});
