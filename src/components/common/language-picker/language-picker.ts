import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Dropdown, Menu, Button } from "ant-design-vue";
import { DownOutlined, DownloadOutlined, GlobalOutlined } from "@ant-design/icons-vue";
import { languages } from "./constants";

export default defineComponent({
  components: {
    DownOutlined,
    DownloadOutlined,
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
    };
    const labelCurrentLanguage = computed(() => languages.find(i => i.value == locale.value)?.label);
    const currentLanguageCode = computed(() => locale.value);
    const classGenerator = (value: string) => `language-picker__menu--item__icon--${value}`;
    return { languages, handleClick, labelCurrentLanguage, currentLanguageCode, classGenerator };
  },
});
