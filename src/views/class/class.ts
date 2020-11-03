import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  TeacherCard,
  LessonPlan,
  ActivityContent,
  StudentGallery,
  GlobalAudioBar,
} from "./components";
export default defineComponent({
  components: {
    TeacherCard,
    LessonPlan,
    ActivityContent,
    GlobalAudioBar,
    StudentGallery,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const teacher = store.getters["class/teacher"];

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
      router.back();
    };
    return {
      onClickHideAll,
      onClickMuteAll,
      onClickEnd,
      currentView,
      isGalleryView,
      setClassView,
      views,
      teacher,
    };
  },
});
