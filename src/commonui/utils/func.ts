import i18n from "../locales/i18n";

const buildSuffix = (suffix: any, key: any) => {
	return suffix ? (suffix.startsWith(key) ? suffix : `${key}${suffix}`) : "";
};

const buildUrl = (page: any) => {
	try {
		if (typeof page === "string") {
			return page;
		} else {
			const { pathname, search, hash } = page as { pathname: string; search: string; hash: string };

			return `${pathname}${buildSuffix(search, "?")}${buildSuffix(hash, "#")}`;
		}
	} catch (e) {
		// diagnosticLogError({ error: e, message: 'buildUrl' })
		console.error(e);
		return "/";
	}
};

export function locationReplace(page: string) {
	window.location.replace(buildUrl(page));
}

export const FormatMessage = (id: string, params?: {}): string => {
	//import i18n from "./commonui/locales/i18n";
	return i18n.t(id, params) as string;
};

export const fmtMsg = FormatMessage;

export function isLocalEnvironment(): boolean {
	return process.env.VUE_APP_ENVIRONMENT === "local";
}
