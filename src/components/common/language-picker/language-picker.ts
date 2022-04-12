import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Dropdown, Menu, Button } from "ant-design-vue";
import { DownOutlined, GlobalOutlined } from "@ant-design/icons-vue";
import { languages } from "./constants";
import { I18N_LOCALE } from "@/utils/constant";

export default defineComponent({
  components: {
    DownOutlined,
    GlobalOutlined,
    Dropdown,
    Menu,
    MenuItem: Menu.Item,
    Button,
  },
  setup() {
    const { t, locale } = useI18n({ useScope: "global" });
    const handleClick = (e: any) => {
      locale.value = e.key;
      localStorage.setItem(I18N_LOCALE, e.key);
    };
    const labelCurrentLanguage = computed(() => languages.find((i) => i.value == locale.value)?.label);
    const currentLanguageCode = computed(() => locale.value);
    return { languages, handleClick, labelCurrentLanguage, currentLanguageCode };
  },
});
