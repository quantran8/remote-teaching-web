import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
export default defineComponent({
  components: {
    ClassCard,
  },
  created(){
    const store = useStore();
    store.dispatch("room/loadRooms");
  },
  setup() {
    const store = useStore();
    const classes = computed(() => store.getters["teacher/classes"]);
    const username = computed(() => store.getters["auth/username"]);
    return { classes, username };
  },
});
