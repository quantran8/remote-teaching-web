import * as Cookies from "js-cookie";
import { LoginInfo } from "@/commonui";
import { AuthService } from "../services";
import moment from "moment";
import * as Bowser from "bowser";
import * as pathToRegexp from "path-to-regexp";
import * as querystring from "query-string";

export interface IResourceOperation<T> {
	default(value?: T | any): any;
	create(value?: T | any): any;
	update(value?: T | any): any;
	delete(value?: T | any): any;
	select(value?: T | any): any;
}
export interface CookiesOptions {
	expires?: number | Date;
	path?: string;
	domain?: string;
	secure?: boolean;
}
export interface CookiesFn {
	set(name: string, value: any, options?: CookiesOptions): any;
	get(): any;
	get(name: string): any;
	getJSON(): any;
	getJSON(name: string): any;
	remove(name: string): any;
	remove(name: string, options?: CookiesOptions): any;
}
function nestedClone(myObj: any) {
	if (typeof myObj != "object" || myObj == null) return myObj;
	const newObj: any = {};
	for (const i in myObj) {
		newObj[i] = nestedClone(myObj[i]);
	}
	return newObj;
}
export function SimplyProxy(target: any, handle: any) {
	const targetCopy = nestedClone(target);
	Object.keys(targetCopy).forEach((key) => {
		Object.defineProperty(targetCopy, key, {
			get: () => {
				return handle.get && handle.get(target, key);
			},
			set: (newVal) => {
				handle.set && handle.set();
				target[key] = newVal;
			}
		});
	});
	return targetCopy;
}

export class MergeDocHelper {
	static buildDoc(op: any, obj: any, path: any) {
		const arr: any[] = Object.getOwnPropertyNames(obj).map((key) => {
			const value = obj[key];
			if (value === null || value === undefined) return [];
			if (value instanceof Object) {
				return MergeDocHelper.buildDoc(op, value, `${path}${key}/`);
			}
			return [{ op, path: `${path}${key}`, value }];
		});
		return arr.reduce((pre, cur) => pre.concat(cur));
	}

	//{a:1,b:{c:'2'}} -> [{op:'replace',path:'/a',value:1},{op:'replace',path:'/b/c',value:'2'}]
	static replace(obj: any, path: string = "/") {
		return MergeDocHelper.buildDoc("replace", obj, path);
	}
}

export function alignPop({
	type,
	querySelector,
	getPopupContainer = (node: any) => node.parentElement
}: { type?: string; querySelector?: string; getPopupContainer?: any } = {}) {
	const getContainer = (key: any) => {
		if (querySelector) {
			return { [key]: () => document.querySelector(querySelector) };
		} else {
			return { [key]: getPopupContainer };
		}
	};
	if (type === "DatePicker") {
		return getContainer("getCalendarContainer");
	} else {
		return getContainer("getPopupContainer");
	}
}

export function isPC() {
	const userAgentInfo = navigator.userAgent;
	const Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
	let flag = true;
	Agents.forEach((v, k) => {
		if (userAgentInfo.indexOf(v) > 0) {
			return (flag = false);
		}
	});
	return flag;
}

export function afterDate(date: moment.MomentInput = moment()) {
	return (current: any) => {
		return moment(current, "YYYY/MM/DD").isAfter(moment(date, "YYYY/MM/DD"));
	};
}
export function beforeDate(date: moment.MomentInput = moment()) {
	return (current: any) => {
		return moment(current, "YYYY/MM/DD").isBefore(moment(date, "YYYY/MM/DD"));
	};
}
export function betweenDate(min: moment.MomentInput = moment(), max: moment.MomentInput = moment()) {
	return (current: any) => {
		return moment(current, "YYYY/MM/DD").isBetween(moment(min, "YYYY/MM/DD"), moment(max, "YYYY/MM/DD"));
	};
}

// export function polyfillSupport() {
// 	return Promise.resolve({}).then(ensureIntlSupport);
// }
export function openPage(pathname: string, query?: string) {
	const url = `${pathname}${query ? `?${query}` : ""}`;
	if (isPC()) {
		window.open(url);
	} else {
		document.location.href = url;
	}
}

export type IBowser = Bowser.Parser.Parser;
export function browser(userAgent?: string): IBowser {
	return Bowser.getParser(userAgent || window.navigator.userAgent);
}

export const CONSTS = {
	COUNTRY_CODE: "gl-vcs.countrycode"
};

export function clearAppLocalStorageData() {
	localStorage.removeItem(CONSTS.COUNTRY_CODE);
}

export function isGuid(str: string) {
	return str && str.match(/[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}/) !== null;
}
export function isNumber(str: string) {
	return str && typeof str === "string" && str.match(/(^[\-0-9][0-9]*(.[0-9]+)?)$/) !== null;
}

export function removeSpecialCharactersFromString(str: string): string {
	return str.replace(/[^\w\s]/gi, "");
}

export function isContainsSpecialCharaters(str: string): boolean {
	return /[^\w\s]/gi.test(str);
}

export class GLGlobal {
	public static processEnv = () => process.env;
	public static appEnv = () => GLGlobal.processEnv().VUE_APP_ENVIRONMENT;
	public static apiPrefix = () => GLGlobal.processEnv().VUE_APP_API_PREFIX;
	public static multipleApiPrefixes = () => "";
	public static authorityUrl = () => GLGlobal.processEnv().VUE_APP_AUTHORITY_URL;
	public static authorityClientId = () => GLGlobal.processEnv().VUE_APP_AUTHORITY_CLIENT_ID;
	public static authorityClientSecret = () => GLGlobal.processEnv().VUE_APP_AUTHORITY_CLIENT_SECRET;
	public static appClientUrl = () => GLGlobal.processEnv().VUE_APP_CLIENT_URL;
	public static loginInfo = () => AuthService.getLoginInfo();
	public static refreshLoginInfo = () => AuthService.signinSilent();
	public static defaultIpApiConfig = () => ({
		domain: "https://ipapi.co",
		contentType: "json",
		key: "",
		enabled: false
	});
	public static ipApiConfig = () => {
		const ipApiConfig = GLGlobal.processEnv().IP_API;

		// If config is not available from process env, return the default ip api config.
		return ipApiConfig ? (ipApiConfig as any) : GLGlobal.defaultIpApiConfig();
	};
	public static workEnv = () => ({
		isDevelopment: () => GLGlobal.processEnv().WORK_ENV === "uat",
		isTest: () => GLGlobal.processEnv().WORK_ENV === "jptest",
		isProdction: () => GLGlobal.processEnv().WORK_ENV === "pub"
	});
}

export class GLUtil {
	static queryStringify<T = any>(
		obj: T,
		opts?: { strict?: boolean; encode?: boolean; arrayFormat?: "none" | "bracket" | "index" }
	): string {
		return querystring.stringify(obj as any, opts);
	}
	static parsePath(path?: string) {
		const origin =
			window.location.protocol +
			"//" +
			window.location.hostname +
			(window.location.port ? ":" + window.location.port : "") +
			"/#/";
		if (window.location.href.indexOf(origin) >= 0) {
			let pathname = path || window.location.href.substr(window.location.href.indexOf("#") + 1);
			let search = "";
			let hash = "";

			const hashIndex = pathname.indexOf("#");
			if (hashIndex !== -1) {
				hash = pathname.substr(hashIndex);
				pathname = pathname.substr(0, hashIndex);
			}

			const searchIndex = pathname.indexOf("?");
			if (searchIndex !== -1) {
				search = pathname.substr(searchIndex);
				pathname = pathname.substr(0, searchIndex);
			}

			return {
				pathname: pathname,
				search: search === "?" ? "" : search,
				hash: hash === "#" ? "" : hash
			};
		} else {
			return {
				pathname: window.location.pathname,
				search: window.location.search,
				hash: window.location.hash
			};
		}
	}

	static cookies: CookiesFn = { ...Cookies };

	// need to  correct these functions during localization setup

	static setLocaleCookie(language: string) {
		if (language.startsWith("zh")) {
			language = "zh-Hans";
		} else if (language.startsWith("ar")) {
			language = "ar-SA";
		} else {
			language = language.split(/[_-]+/)[0];
		}
		GLUtil.cookies.set("GrapeSeed.Culture", `c=${language}|uic=${language}`, {
			domain:
				process.env.portalsDomain || process.env.VUE_APP_AUTHORITY_URL.replace(/.*?\.(.*?\.[com|net])/, "$1")
		});
	}

	static pathStringify<T = any>(pathname: string, obj: T, opts?: { encode: (value:any) => any }): string {
		const toPath = pathToRegexp.compile(pathname, opts);
		return toPath(obj as any);
	}

	static getLanguageFromCookie() {
		let culture = GLUtil.cookies.get("GrapeSeed.Culture");
		return culture
			? ((culture = culture.match(/^.*\|.*=(.*?)$/)[1]),
			  culture.startsWith("zh") ? "zh-cn" : culture).toLowerCase()
			: "";
	}

	static isNullOrUndefined(obj: any): boolean {
		return obj === null || obj === undefined;
	}

	static blobToArray(blob: any, callback?: any) {
		return new Promise((resolve, reject) => {
			const fileReader = new FileReader();
			fileReader.onload = function (e) {
				const arrayBuffer = this.result;
				const array = GLUtil.arrayBufferToArray(arrayBuffer);
				callback && callback(array);
				resolve(array);
			};
			fileReader.readAsArrayBuffer(blob);
		});
	}

	static arrayToArrayBuffer(array: any) {
		const buf = new ArrayBuffer(array.length);
		const bytes = new Uint8Array(buf);
		bytes.set(array);
		return buf;
	}

	static arrayBufferToArray(buf: any) {
		return Array.from(new Uint8Array(buf));
	}

	static arrayToBlob(array: any) {
		return new Blob([GLUtil.arrayToArrayBuffer(array)]);
	}

	static isInternetExplorer() {
		return !!(document as any).documentMode;
	}
	static base64Encode(str: any) {
		// first we use encodeURIComponent to get percent-encoded UTF-8,
		// then we convert the percent encodings into raw bytes which
		// can be fed into btoa.
		return btoa(
			encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
				return String.fromCharCode(parseInt(p1, 16));
			})
		);
	}
	static base64Decode(str: any) {
		// Going backwards: from bytestream, to percent-encoding, to original string.
		return decodeURIComponent(
			atob(str)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join("")
		);
	}

	static isExpired({ expires_at, expired }: LoginInfo) {
		if (expired === undefined && expires_at) {
			return expires_at - Math.floor(Date.now() / 1000) <= 0;
		}
		return expired;
	}
}
