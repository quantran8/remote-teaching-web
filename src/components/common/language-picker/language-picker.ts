import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { GLGlobal } from "vue-glcommonui";
import { Dropdown, Menu, Button } from "ant-design-vue";
import { DownOutlined, GlobalOutlined } from "@ant-design/icons-vue";
import { languages } from "./constants";

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
    const handleClick = (e: any) => {
      GLGlobal.i18n.global.locale = e.key;
    };
    const labelCurrentLanguage = computed(() => languages.find(i => i.value == GLGlobal.i18n.global.locale)?.label);
    const currentLanguageCode = computed(() => GLGlobal.i18n.global.locale);
    return { languages, handleClick, labelCurrentLanguage, currentLanguageCode };
  },
});
