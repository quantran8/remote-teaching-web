import { defineComponent } from "vue";
import {
	DropdownHelper, DropdownItem, HeaderMenuItem,fmtMsg
} from "vue-glcommonui";
import { HelpMenuLocal } from "@/locales/localeid";

interface HelpMenuItem {
    textLocaleId: string;
    url?: string;
    color: string;
}


export default defineComponent({
    components: {
        DropdownItem,
        DropdownHelper,
        HeaderMenuItem,
    },
    setup() {
        const displayedHelpMenu: HelpMenuItem[] = [
            {
                textLocaleId: HelpMenuLocal.Help,
                url: process.env.VUE_APP_HELP_URL,
                color: "#5c2d91",
            },
            {
                textLocaleId: HelpMenuLocal.Contact,
                url: 'https://help.grapeseed.com/gl/region-index.html',
                color: "#5c2d91",
            },
        ];
        return {
            displayedHelpMenu,
			fmtMsg
        };
    },
});
