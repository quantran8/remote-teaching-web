import { TeacherHome } from "@/locales/localeid";
import { computed, defineComponent } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    const route = useRoute();
    const homeText = computed(() => fmtMsg(TeacherHome.Home));
    const galleryText = computed(() => fmtMsg(TeacherHome.Gallery));
    const scheduleText = computed(() => fmtMsg(TeacherHome.Schedule));
    const isParentAndTeacher = store.getters["auth/isParentAndTeacher"];

    const router = useRouter();
    const onClickHome = async () => {
      if (isParentAndTeacher) {
        await router.push("/");
      }
      if (route.path.includes("teacher")) {
        await router.push("/teacher");
      }
    };
    const onClickCalendar = async () => {
      await router.push("/teacher-calendars");
    };
    return { onClickHome, onClickCalendar, homeText, galleryText, scheduleText };
  },
});
