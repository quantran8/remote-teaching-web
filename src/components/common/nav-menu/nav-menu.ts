import { TeacherHome } from "@/locales/localeid";
import { computed, defineComponent } from "vue";
import { fmtMsg } from "vue-glcommonui";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const homeText = computed(() => fmtMsg(TeacherHome.Home));
    const galleryText = computed(() => fmtMsg(TeacherHome.Gallery));
    const scheduleText = computed(() => fmtMsg(TeacherHome.Schedule));

    const router = useRouter();
    const onClickHome = async () => {
      await router.push("/");
    };
    const onClickCalendar = async () => {
      await router.push("/teacher-calendars");
    };
    return { onClickHome, onClickCalendar, homeText, galleryText, scheduleText };
  },
});
