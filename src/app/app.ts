import { defineComponent } from "vue";
import { useStore } from "vuex";
import { MainLayout, AppHeader, AppFooter } from "../components/layout";
export default defineComponent({
  components: {
    MainLayout,
    AppHeader,
    AppFooter,
  },
  setup() {
    const { getters } = useStore();
    const isHeaderVisible = () => getters.isHeaderVisible;
    const isFooterVisible = () => getters.isFooterVisible;
    return { isHeaderVisible, isFooterVisible };
  },
});
