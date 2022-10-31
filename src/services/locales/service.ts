import {GLServiceBase} from "vue-glcommonui";

class GLLocaleService extends GLServiceBase<any, any> {
    serviceRoute = {prefix: ""};

    getLocaleJson(locale: string): Promise<any> {
        if (process.env.VUE_APP_TRANSLATIONS_FROM_LOCALIZER) {
            const url = process.env.VUE_APP_TRANSLATIONS_FROM_LOCALIZER.replace("{locale}", locale);
            return this.request.agent().get(url).then(res => {
                return JSON.parse(res.text);
            });
        }
        /** fallback to load the local JSON */
        return Promise.reject();
    }
}

export const LocaleService = new GLLocaleService();
