import { AuthService } from "@/commonui";
import { AppView } from "@/store/app/state";
import { computed, defineComponent, watch } from "vue";
import { useRouter } from 'vue-router';
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
    const store = useStore();
    const isHeaderVisible = computed(() => store.getters.appLayout !== "full");
    const isFooterVisible = computed(() => store.getters.appLayout !== "full");
    const isSignedIn = computed(() => store.getters["auth/isLoggedIn"]);
    const appView = computed(() => store.getters["appView"]);
    const router = useRouter();
    watch([isSignedIn], () => {
      if (!isSignedIn.value) {
        // user slient signed out from account side.
        // AuthService.storePagethenSignoutRedirect();
        router.replace('/access-denied');
      } else {
        store.dispatch("setAppView", {
          appView: AppView.Authorized,
        });
      }
    });

    return {
      appView,
      isSignedIn,
      isHeaderVisible,
      isFooterVisible,
    };
  },
});
