import { AppFooter, AppHeader } from "@/components/layout";
import { AccessInformationScreenLocale, CommonLocale } from "@/locales/localeid";
import { ParentService } from "@/services";
import { computed, defineComponent, onMounted } from "vue";
import { fmtMsg, MainLayout } from "vue-glcommonui";
import { useRouter } from "vue-router";
const GRAPE_SEED_CONTACT_PAGE_URL = "https://grapeseed.com/contact/";
export default defineComponent({
  components: {
    AppHeader,
    AppFooter,
    MainLayout,
  },
  setup() {
    const Line1 = computed(() => fmtMsg(AccessInformationScreenLocale.Line1));
    const Line2 = computed(() => fmtMsg(AccessInformationScreenLocale.Line2));
    const Line3 = computed(() => fmtMsg(AccessInformationScreenLocale.Line3));
    const Line4 = computed(() => fmtMsg(AccessInformationScreenLocale.Line4));
    const Line5Part1 = computed(() => fmtMsg(AccessInformationScreenLocale.Line5Part1));
    const Line5Part2 = computed(() => fmtMsg(AccessInformationScreenLocale.Line5Part2));
    const Line6 = computed(() => fmtMsg(AccessInformationScreenLocale.Line6));
    const Link = computed(() => fmtMsg(AccessInformationScreenLocale.ContactLink));
    const SiteTitle = computed(() => fmtMsg(CommonLocale.CommonSiteTitle));
    const contactURL = GRAPE_SEED_CONTACT_PAGE_URL;
    const router = useRouter();
    onMounted(async () => {
      const canAccess = await ParentService.getGSConnectAccess();
      if (canAccess) {
        router.push("/parent");
      }
    });
    return { Line1, Line2, Line3, Line4, Line5Part1, Line5Part2, Line6, Link, SiteTitle, contactURL };
  },
});
