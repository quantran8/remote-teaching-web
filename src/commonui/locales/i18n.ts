import { createI18n } from "vue-i18n";

function loadLocaleMessages() {
  //#TODO make generic path
  const locales = require.context(
    "../../locales",
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i
  );
  const messages: any = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      console.error(locale, "lllllllllllllllllllllll");
      messages[locale] = locales(key);
    }
  });
  return messages;
}

export default createI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages: loadLocaleMessages(),
});
