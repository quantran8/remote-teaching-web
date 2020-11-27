import { RoomManager } from "@/manager/room/base.manager";
import { ClassView, TeacherState } from '@/store/room/interface';
import { computed, defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  TeacherCard,
  LessonPlan,
  ActivityContent,
  StudentGallery,
  GlobalAudioBar,
  LeaveModal,
} from "./components";
export default defineComponent({
  components: {
    TeacherCard,
    LessonPlan,
    ActivityContent,
    GlobalAudioBar,
    StudentGallery,
    LeaveModal,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const teacher: TeacherState = store.getters["teacherRoom/teacher"];
    const showModal = ref(false);
    const hasConfirmed = ref(false);
    const roomManager = store.getters["teacherRoom/roomManager"] as RoomManager;

    const views = [
      { id: ClassView.GALLERY, name: "Gallery", icon: "" },
      { id: ClassView.LESSON_PLAN, name: "LessonPlan", icon: "" },
      { id: ClassView.WHITE_BOARD, name: "Whiteboard", icon: "" },
      { id: ClassView.GAME, name: "Game", icon: "" },
    ];

    const currentView = computed(() => {
      return store.getters["teacherRoom/classView"];
    });

    const isGalleryView = computed(() => {
      return store.getters["teacherRoom/isGalleryView"];
    });

    const setClassView = (newView: ClassView) => {
      store.dispatch("teacherRoom/setClassView", { classView: newView });
    };

    const onClickHideAll = () => {
      store.dispatch("teacherRoom/hideAllStudents");
    };
    const onClickShowAll = () => {
      store.dispatch("teacherRoom/showAllStudents");
    };

    const onClickMuteAll = () => {
      store.dispatch("teacherRoom/muteAllStudents");
    };

    const onClickUnmuteAll = () => {
      store.dispatch("teacherRoom/unmuteAllStudents");
    };

    const onClickEnd = () => {
      showModal.value = true;
    };

    const onClickLeave = () => {
      hasConfirmed.value = true;
      store.dispatch("teacherRoom/endClass");
      router.replace("/teacher");
    };

    const onClickCloseModal = () => {
      showModal.value = false;
    };

    const joinRoom = () => {
      roomManager.join({
        camera: teacher.videoEnabled,
        microphone: teacher.audioEnabled,
        publish: true,
      });
    };
    joinRoom();

    const onTeacherChanged = async () => {
      roomManager.setCamera({
        enable: teacher.videoEnabled,
        publish: teacher.videoEnabled,
      });

      roomManager.setMicrophone({
        enable: teacher.audioEnabled,
      });
    };

    watch(teacher, onTeacherChanged);

    watch(roomManager.remoteUsers, () => {
      console.log(roomManager.remoteUsers);
    });

    return {
      showModal,
      onClickHideAll,
      onClickShowAll,
      onClickMuteAll,
      onClickUnmuteAll,
      onClickEnd,
      currentView,
      isGalleryView,
      setClassView,
      views,
      teacher,
      onClickLeave,
      onClickCloseModal,
    };
  },
});
