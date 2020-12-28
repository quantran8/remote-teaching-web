import { RemoteTeachingService } from "@/services";
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import StudentCard from "./components/student-card/student-card.vue";
export default defineComponent({
  components: {
    StudentCard,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const children = computed(() => store.getters["parent/children"]);
    const username = computed(() => store.getters["auth/username"]);
    const onClickChild = async (student: any) => {
      router.push(`/student/${student.id}/class/${student.schoolClassId}`);
    };
    return { children, username, onClickChild };
  },
});
