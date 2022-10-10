import { I18N_LOCALE } from "@/utils/constant";
import { createI18n } from "vue-i18n";
import {LocaleService} from "@/services/locales";
import {GLGlobal} from "vue-glcommonui";

const fallbackLocale = process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en";
const currentLocale = localStorage.getItem(I18N_LOCALE) || fallbackLocale;

function loadLocaleMessages() {
  const locales = require.context("../locales", true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages: any = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  loadAsyncLocale();
  return messages;
}

function setLocaleMessages(locale: string, messages: any) {
  GLGlobal.i18n.global.setLocaleMessage(locale, messages);
}

export function loadAsyncLocale(locale: string = currentLocale) {
  LocaleService.getLocaleJson(locale).then((res) => {
    setLocaleMessages(locale, res);
  }).catch(() => {
    //
  });
}

export const persistLocale = (locale: string) => {
  localStorage.setItem(I18N_LOCALE, locale);
};

export default createI18n({
  locale: currentLocale,
  fallbackLocale: fallbackLocale,
  messages: loadLocaleMessages(),
});
