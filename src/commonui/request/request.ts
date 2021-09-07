import * as request from "superagent";
import { IGLRequestErrorHandler, GLRequestErrorHandler } from "./requestErrorHandler";
import corsProxy, { corsMultipartProxy } from "./cors";
import { CONSTS, GLGlobal, GLUtil, isLocalEnvironment, PaginationParams } from "../utils";
import "reflect-metadata";
import { AuthService } from "../services";

export type ObjectArray = object | any[];

export const reqIgnoreMetadataKey = Symbol("reqIgnore");
export function reqIgnore(target?: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
	Reflect.defineMetadata(reqIgnoreMetadataKey, true, target, propertyKey!);
}

export interface GLBase {}
export type GLRequest = GLBase;

export interface GLMergeDoc {
	op: "add" | "remove" | "replace" | "copy" | "move" | "test";
	path: string;
	value?: any;
	from?: string;
}

export class GLOffSetRequest {
	readonly limit: any;
	readonly offset: any;
	constructor();
	constructor(searchParams: object);
	constructor(offset: number, limit: number, searchParams?: object);
	constructor(offset?: number | object, limit?: number, searchParams?: object) {
		let params: any = null;
		if (offset === 0 || typeof offset === "number") {
			this.offset = offset;
			this.limit = limit;
			params = searchParams;
		} else {
			params = offset;
		}
		params &&
			Object.getOwnPropertyNames(params).map(
				(key) => !Reflect.hasMetadata(reqIgnoreMetadataKey, params, key) && ((this as any)[key] = params[key])
			);
	}
}

export class GLPagingRequest extends GLOffSetRequest {
	@reqIgnore
	readonly index: number;
	sortBy: any;
	isDescending: any;
	constructor(pagingParams: PaginationParams);
	constructor(index: number, limit: any, searchParams?: object);
	constructor(index?: number | PaginationParams, limit?: any, searchParams?: object) {
		if (index && typeof index === "number") {
			super((index - 1) * limit, limit, searchParams);
			this.index = index;
		} else {
			index = index as PaginationParams;
			super((index.current - 1) * index.pageSize, index.pageSize, index);
			this.index = index.current;
		}
	}
}

export type GLResponse = GLBase;
export interface GLPagingResponse extends GLBase {
	data?: any;
	totalCount?: number;
}
export interface GLRequestParam<T> {
	Url?: string;
	Headers?: {
		[key: string]: string | null;
	}[];
	Data?: T;
	Querys?: GLBase;
	Prefix?: string;
	RequstIsBlob?: boolean;
	RequestIsMultipart?: boolean;
}

export interface IGLRequest {
	get(url: string, data?: any, routeData?: any): any;
	post(url: string, data?: any, routeData?: any): any;
	put(url: string, data?: any, routeData?: any): any;
	merge(url: string, data?: GLMergeDoc[] | any, routeData?: any): any;
	del(url: string, data?: any, routeData?: any): any;
	getBlob(url: string, data?: any, routeData?: any): any;
	download({ url, data, routeData, method }: { url: string; data?: any; routeData?: object; method?: string }): any;
	agent(): RequestAgent;
}

export interface ITGLRequest<TRequest, TResponse> extends IGLRequest {
	get<TResp = TResponse, TReq = object | TRequest>(url: string, data?: TReq, routeData?: object): Promise<TResp>;
	post<TResp = TResponse, TReq = ObjectArray | TRequest>(
		url: string,
		data?: TReq,
		routeData?: object,
		requestOptions?: GLRequestParam<TReq>
	): Promise<TResp>;
	postMultipart<TResp = TResponse, TReq = ObjectArray | TRequest>(
		url: string,
		data?: TReq,
		routeData?: object,
		requestOptions?: GLRequestParam<TReq>
	): Promise<TResp>;
	put<TResp = TResponse, TReq = ObjectArray | TRequest>(url: string, data?: TReq, routeData?: object): Promise<TResp>;
	merge<TResp = TResponse, TReq = GLMergeDoc[] | any>(url: string, data?: TReq, routeData?: object): Promise<TResp>;
	del<TResp = TResponse, TReq = ObjectArray | TRequest>(url: string, data?: TReq, routeData?: object): Promise<TResp>;
	getBlob<TResp = TResponse, TReq = object | TRequest>(url: string, data?: TReq, routeData?: object): Promise<TResp>;
	download<TResp = TResponse, TReq = object | TRequest>({
		url,
		data,
		routeData,
		method
	}: {
		url?: string;
		data?: TReq;
		routeData?: object;
		method?: string;
	}): Promise<TResp>;
}
function getTimeZone() {
	let timezoneName = "";
	try {
		timezoneName = `${(Intl && Intl.DateTimeFormat && new Intl.DateTimeFormat().resolvedOptions().timeZone) || ""}`;
	} finally {
		return `${timezoneName} (${new Date().getTimezoneOffset() / 60})`;
	}
}
export class GLRequestProxy<TRequest, TResponse extends GLResponse> implements ITGLRequest<TRequest, TResponse> {
	getDefaultParam(): GLRequestParam<TRequest> {
		const { enabled } = GLGlobal.ipApiConfig();
		return {
			Url: "",
			Data: undefined,
			Querys: undefined,
			Headers: [
				{
					Authorization: "Bearer " + (GLGlobal.loginInfo().access_token || AuthService.accessToken),
					"Device-Memory": localStorage.getItem("Ram"),
					"x-gl-sub":
						(GLGlobal.loginInfo().loggedin &&
							GLGlobal.loginInfo().profile &&
							GLGlobal.loginInfo().profile.sub) ||
						"",
					"x-gl-origin": window.location.href,
					"x-gl-timezone": getTimeZone(),
					"x-gl-countrycode": enabled ? localStorage.getItem(CONSTS.COUNTRY_CODE) : null
				}
			],
			Prefix: GLGlobal.apiPrefix(),
			RequstIsBlob: false,
			RequestIsMultipart: false
		};
	}
	errorHandler: IGLRequestErrorHandler = new GLRequestErrorHandler();
	trySSOSignin() {
		!GLGlobal.loginInfo().loggedin && !AuthService.accessToken && GLGlobal.refreshLoginInfo();
	}
	processResponse<TResp = TResponse>(
		func: (url: string) => request.SuperAgentRequest,
		param: GLRequestParam<TRequest>
	): Promise<TResp> {
		this.trySSOSignin();
		let request = func(param.Prefix && !param.Url?.startsWith("http") ? param.Prefix + param.Url : "" + param.Url);
		param.RequstIsBlob ? request.responseType("blob") : request.type("json");
		param.Data && request.send(JSON.stringify(param.Data));
		param.Querys && request.query(param.Querys);
		param.Headers &&
			param.Headers.forEach((entry) => {
				request.set(entry);
			});
		param.RequestIsMultipart &&
			request.field((param.Data as any) as { [fieldName: string]: string | Blob }).unset("Content-Type");

		// request.withCredentials();
		return new Promise((resolve, reject) => {
			if (!isLocalEnvironment()) {
				request = request.use(corsProxy({ type: param.RequstIsBlob ? "blob" : "json" }));
			}
			request.end((error, response) => {
				error && this.handlerErr(error, reject);
				response &&
					response.ok &&
					resolve(param.RequstIsBlob ? this.getBlobResult(response) : this.getResultByHeader(response));
			});
		});
	}
	processMultipartResponse<TResp = TResponse>(
		func: (url: string) => request.SuperAgentRequest,
		param: GLRequestParam<TRequest>
	): Promise<TResp> {
		this.trySSOSignin();
		let request = func(param.Prefix && !param.Url?.startsWith("http") ? param.Prefix + param.Url : "" + param.Url);
		request.field((param.Data as any) as { [fieldName: string]: string | Blob }).unset("Content-Type");
		param.Querys && request.query(param.Querys);
		param.Headers &&
			param.Headers.forEach((entry) => {
				request.set(entry);
			});

		Object.getPrototypeOf(request)._getMultipartFormData = function () {
			return param.Data;
		};

		return new Promise((resolve, reject) => {
			if (!isLocalEnvironment()) {
				request = request.use(corsMultipartProxy({ isMultipart: true }));
			}
			request.end((error, response) => {
				error && this.handlerErr(error, reject);
				response &&
					response.ok &&
					resolve(param.RequstIsBlob ? this.getBlobResult(response) : this.getResultByHeader(response));
			});
		});
	}
	handlerErr(err: any, reject: any) {
		err.response || (err.response = { error: { ...err } });
		this.errorHandler.handler(err.response, reject);
	}
	getResultByHeader(response: request.Response) {
		const hasTotalCount = !!response.header["x-total-count"];
		const hasExtraData = !!response.header["x-extra-data"];
		const resp = { data: response.body } as any;
		if (hasTotalCount) {
			resp.totalCount = parseInt(response.header["x-total-count"]);
		}
		if (hasExtraData) {
			resp.extraData = JSON.parse(response.header["x-extra-data"]);
		}
		return hasTotalCount || hasExtraData ? resp : response.body;
	}

	getBlobResult(response: request.Response) {
		return { ...response, data: GLUtil.arrayToBlob(response.body) };
	}

	deleteRequestIgnoreProps(data: any) {
		if (!data || typeof data !== "object" || data instanceof Array) return data;
		const reqData = { ...data };
		Object.getOwnPropertyNames(data).forEach((name) => {
			if (
				GLUtil.isNullOrUndefined(data[name]) ||
				typeof data[name] === "function" ||
				Reflect.hasMetadata(reqIgnoreMetadataKey, data, name)
			) {
				delete reqData[name];
			}
		});
		return reqData;
	}
	buildData(args: IArguments | any[]): GLRequestParam<TRequest> {
		if (typeof args[0] === "string") {
			return {
				...this.getDefaultParam(),
				...{
					Url: args[0],
					Data: args[1]
				},
				...args[2]
			};
		} else {
			return { ...this.getDefaultParam(), ...args[0] };
		}
	}
	buildQueryParam(url: any, data: any, addRandom?: any): any {
		url += "?";
		if (data) {
			const query = (d: any, k: any) => {
				url += `${k}=${encodeURIComponent(d)}&`;
			};
			const judge = (o: any, k: any) => {
				if (o instanceof Array) {
					o.map((o) => judge(o, k));
				} else if (o instanceof Object) {
					Object.getOwnPropertyNames(o).map((k) => {
						judge(o[k], k);
					});
				} else {
					query(o, k);
				}
			};
			//data---[1,{a:2},[3]]---d=1&a=2&d=3
			//data---{a:1,b:{c:2,e:[3,[4]]}}---a=1&c=2&e=3&e=4
			judge(data, "d");
		}
		if (addRandom) {
			url += Date.now() + "&";
		}
		return url.slice(0, url.length - 1);
	}
	buildRouterParam(url: any, data?: any, routeData?: any) {
		if ((url as string).lastIndexOf("}") < 0 || (!routeData && !data) || (data instanceof Array && !routeData)) {
			return url;
		}
		const routeTokens = this.getRouteTokens(url);
		this.fillRouterParam([...routeTokens], routeData || data);
		return this.formatUrlByRouteParam(url, routeTokens);
	}
	getRouteTokens(url: string) {
		const reg = /\{(.+?)\}/g;
		const tokens: any[] = [];
		let execArr: any = [];
		while ((execArr = reg.exec(url))) {
			const token = { name: execArr[1] };
			tokens.push(token);
		}
		return tokens;
	}
	fillRouterParam(tokens?: { name: string; value?: any }[], data?: any) {
		tokens = tokens?.filter((token) => {
			if (data[token.name] != undefined && data[token.name] != null) {
				token.value = data[token.name];
				return false;
			}
			return true;
		});
		if (tokens?.length === 0) return true;

		Object.getOwnPropertyNames(data).some((prop) => {
			if (typeof data[prop] === "object" && data[prop]) {
				return this.fillRouterParam(tokens, data[prop]);
			}
		});
	}
	formatUrlByRouteParam(url: string, tokens: any) {
		tokens.forEach((token:any) => {
			if (token.value == undefined || token.value == null) {
				throw `{${token.name}}: route token to be empty`;
			}
			url = url.replace(`{${token.name}}`, encodeURIComponent(token.value));
		});
		return url;
	}

	get<TResp = TResponse, TReq = object | TRequest>(url: string, data?: TReq, routeData?: object): Promise<TResp> {
		data = this.deleteRequestIgnoreProps(data);
		return this.processResponse<TResp>(
			request.get,
			this.buildData([this.buildQueryParam(this.buildRouterParam(url, data, routeData), data, true), data])
		);
	}
	post<TResp = TResponse, TReq = ObjectArray | TRequest>(
		url: string,
		data?: TReq,
		routeData?: object,
		requestOptions?: GLRequestParam<TReq>
	): Promise<TResp> {
		data = this.deleteRequestIgnoreProps(data);
		return this.processResponse<TResp>(
			request.post,
			this.buildData([this.buildRouterParam(url, data, routeData), data, requestOptions])
		);
	}
	postMultipart<TResp = TResponse, TReq = ObjectArray | TRequest>(
		url: string,
		data?: TReq,
		routeData?: object,
		requestOptions?: GLRequestParam<TReq>
	): Promise<TResp> {
		data = this.deleteRequestIgnoreProps(data);
		return this.processMultipartResponse<TResp>(
			request.post,
			this.buildData([this.buildRouterParam(url, data, routeData), data, requestOptions])
		);
	}
	put<TResp = TResponse, TReq = ObjectArray | TRequest>(
		url: string,
		data?: TReq,
		routeData?: object
	): Promise<TResp> {
		data = this.deleteRequestIgnoreProps(data);
		return this.processResponse<TResp>(
			request.put,
			this.buildData([this.buildRouterParam(url, data, routeData), data])
		);
	}
	del<TResp = TResponse, TReq = ObjectArray | TRequest>(
		url: string,
		data?: TReq,
		routeData?: object
	): Promise<TResp> {
		data = this.deleteRequestIgnoreProps(data);
		return this.processResponse<TResp>(
			request.delete,
			this.buildData([this.buildQueryParam(this.buildRouterParam(url, data, routeData), data), data])
		);
	}
	merge<TResp = TResponse, TReq = GLMergeDoc[] | any>(url: string, data?: TReq, routeData?: object) {
		data = this.deleteRequestIgnoreProps(data);
		return this.processResponse<TResp>(
			request.patch,
			this.buildData([this.buildRouterParam(url, data, routeData), data])
		);
	}
	getBlob<TResp = TResponse, TReq = object | TRequest>(url: string, data?: TReq, routeData?: object): Promise<TResp> {
		return this.download({ url, data, routeData });
	}
	download<TResp = TResponse, TReq = object | TRequest>({
		url,
		data,
		routeData,
		method
	}: {
		url?: string;
		data?: TReq;
		routeData?: object;
		method?: string;
	}): Promise<TResp> {
		data = this.deleteRequestIgnoreProps(data);
		const requestParams = this.buildData([
			this.buildQueryParam(this.buildRouterParam(url, data, routeData), data, true),
			data
		]);
		requestParams.RequstIsBlob = true;
		return this.processResponse<TResp>(method ? (request as any)[method] : request.get, requestParams);
	}
	agent(): RequestAgent {
		return (request as any) as RequestAgent;
	}
}
export type RequestAgent = request.SuperAgentStatic;
