import { computed, defineComponent, ref } from "vue";
import { AppHeader, LanguagePicker, UserAvatar, BaseIcon, DrawerHelper, fmtMsg, DropdownItem } from "vue-glcommonui";
import { DeviceTester, ResourceMenu , HelpMenu} from "@/components/common";
import { Layout } from "@/locales/localeid";
import { useRouter, useRoute } from "vue-router";
import { store } from "@/store";

export default defineComponent({
  props: {
    title: String,
  },
  components: {
    AppHeader,
    LanguagePicker,
    UserAvatar,
    BaseIcon,
    DrawerHelper,
    DeviceTester,
    DropdownItem,
    ResourceMenu,
	HelpMenu
  },
  setup() {
	const router = useRouter();
	const route = useRoute();
    const deviceTesterRef = ref<InstanceType<typeof DeviceTester>>();
    const testConnectText = computed(() => fmtMsg(Layout.TestConnect));
	const currentSchoolId = computed(() => store.getters["teacher/currentSchoolId"]);
	const isShowWriterReview = computed(() => route.path === "/teacher");
    const onClickTestDevice = () => {
      deviceTesterRef.value?.showModal();
    };
	const onClickWriterReview = () => {
		if(isShowWriterReview.value){
			router.push(`/teacher/image-view/${currentSchoolId.value}`)
		}
	}
    return {
      onClickTestDevice,
	  onClickWriterReview,
      deviceTesterRef,
      testConnectText,
	  isShowWriterReview
    };
  },
});
