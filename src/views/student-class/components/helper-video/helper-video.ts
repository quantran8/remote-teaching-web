import { HelperState } from "@/store/room/interface";
import { CloseOutlined, PushpinOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

const MODAL_CONTENT = "helper-vfm-modal-content"; //unique className
export default defineComponent({
  components: { PushpinOutlined, CloseOutlined },
  setup(props) {
    const store = useStore();
    const showed = computed(() => true);
    const helperInfo = computed<HelperState>(() => store.getters["studentRoom/helperInfo"]);
    return { showed, MODAL_CONTENT, helperInfo };
  },
});
