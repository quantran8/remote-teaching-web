import { computed, defineComponent, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
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
    const teacher = store.getters["class/teacher"];
    const showModal = ref(false);
    const hasConfirmed = ref(false);

    const views = [
      { id: 1, name: "Gallery", icon: "" },
      { id: 2, name: "LessonPlan", icon: "" },
      { id: 3, name: "Whiteboard", icon: "" },
      { id: 4, name: "Game", icon: "" },
    ];

    const currentView = computed(() => {
      return store.getters["class/view"];
    });

    const isGalleryView = computed(() => {
      return store.getters["class/isGalleryView"];
    });

    const setClassView = (newView: number) => {
      store.dispatch("class/setClassView", { view: newView });
    };

    const onClickHideAll = () => {
      store.dispatch("class/hideAllStudents");
    };

    const onClickMuteAll = () => {
      store.dispatch("class/muteAllStudents");
    };

    const onClickEnd = () => {
      showModal.value = true;
    };

    const onClickLeave = () => {
      hasConfirmed.value = true;
      router.back();
    };

    const onClickCloseModal = () => {
      showModal.value = false;
    };

    // onBeforeRouteLeave((to, from, next) => {
    //   if (!hasConfirmed.value) {
    //     showModal.value = true;
    //     return;
    //   }
    //   next();
    // });

    return {
      showModal,
      onClickHideAll,
      onClickMuteAll,
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
