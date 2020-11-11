import { AuthService } from "@/commonui";
import { computed, defineComponent, watch } from "vue";
import { useStore } from "vuex";
import { MainLayout, AppHeader, AppFooter } from "../components/layout";

export default defineComponent({
  components: {
    MainLayout,
    AppHeader,
    AppFooter,
  },
  created() {
    AuthService.localSilentLogin();
  },
  setup() {
    const { getters } = useStore();
    const isHeaderVisible = computed(() => getters.appLayout !== "full");
    const isFooterVisible = computed(() => getters.appLayout !== "full");
    const isSignedIn = computed(() => getters["auth/isLoggedIn"]);

    watch([isSignedIn], () => {
      if (!isSignedIn.value) {
        console.log("User Signed Out");
      }
    });

    return { isSignedIn, isHeaderVisible, isFooterVisible };
  },
});
