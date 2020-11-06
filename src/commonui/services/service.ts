import {
  GLRequest,
  GLResponse,
  GLPagingRequest,
  ITGLRequest,
  GLRequestProxy,
  GLPagingResponse,
  ObjectArray,
  GLMergeDoc,
  GLRequestParam,
} from "../request";
import {
  MessageHelper,
  HttpMethod,
  ServerExceptionCode,
  SimplyProxy,
  GLGlobal,
  fmtMsg,
} from "@/commonui/utils";
// import { getModule } from "vuex-module-decorators";
// import { Spinner } from "../store/modules/spinner";
import { CommonLocale } from "@/locales/localeid";
import { store } from "@/store";

export type ServiceOptions = {
  needLoader?: boolean;
};

// const spinModule = getModule(Spinner) as Spinner;

export function getServiceMethodKey(
  service: GLServiceBase<any, any>,
  methodType: HttpMethod,
  errorCode: number,
  url?: string
) {
  const targetUrl = url ? url : service.serviceRoute.prefix;
  return `'{"url":"${targetUrl}","method":"${methodType.toLowerCase()}","error":"${errorCode}"}'`;
}

function getNeedLoader(options: ServiceOptions) {
  return (callback: any) => (d?: any) => {
    options.needLoader !== false && callback();
    return d;
  };
}
export function maskThrottle() {
	store.dispatch('spin/setMaskMain', true)
}
export function unmaskThrottle(d?: any) {
  store.dispatch('spin/setMaskMain', false)
  return d;
}
export function customErrMsgs(errMsgs = {}) {
  return {
    LengthOverRun: CommonLocale.CommonHttpLengthOverRun,
    NotFound: CommonLocale.CommonHttpNotFound,
    InvalidGrant: CommonLocale.CommonHttpInvalidGrant,
    TargetIsNullException: CommonLocale.CommonHttpTargetIsNull,
    TargetDisabledException: CommonLocale.CommonHttpTargetDisabled,
    TargetHasExistedException: CommonLocale.CommonHttpTargetHasExisted,
    NoPermissionException: CommonLocale.CommonHttpNoPermission,
    ArgumentIsNullOrInvalidException:
      CommonLocale.CommonHttpArgumentIsNullOrInvalid,
    AggregateException: CommonLocale.CommonHttpAggregate,
    StrongAssociationException: CommonLocale.CommonHttpStrongAssociation,
    CodeHasBeenUsedException: CommonLocale.CommonHttpCodeHasBeenUsed,
    InvitationCodeNotExistException: CommonLocale.CommonHttpCodeNotExist,
    UnsuportedOperationException: CommonLocale.CommonHttpUnsuportedOperation,
    UnknownException: CommonLocale.CommonHttpUnknown,
    ...errMsgs,
  };
}

export function customError(
  service: GLServiceBase<any, any>,
  methodType: HttpMethod,
  url?: string
) {
  const errMsgs = service.errMsgs;
  const internalMsgs = customErrMsgs();
  return (resp: any) => {
    unmaskThrottle();
    const { status, body } = resp;

    if (status === ServerExceptionCode.BadRequest && body && errMsgs) {
      const error = (msg: any, values?: any) =>
        msg &&
        MessageHelper.ShowError({
          error: body.error,
          error_description: fmtMsg(msg, values) || msg,
          error_code: body.error_code,
        });

      const methodKey = getServiceMethodKey(
        service,
        methodType,
        body.error_code,
        url
      );
      const customizedMessage = errMsgs[methodKey];
      if (customizedMessage) {
        const formattedValues = customizedMessage.values
          ? Object.keys(customizedMessage.values).reduce(function(
              pre: any,
              cur,
              index
            ) {
              const value = customizedMessage.values[cur];
              pre[cur] = value.id ? fmtMsg(value.id).toLowerCase() : value;
              return pre;
            },
            {})
          : undefined;
        customizedMessage.id
          ? error(customizedMessage.id, formattedValues)
          : error(customizedMessage);
      } else if (
        body.error_code == ServerExceptionCode.InvalidGrant ||
        body.error_code == ServerExceptionCode.NoPermissionException
      ) {
        error(internalMsgs.NoPermissionException);
      } else {
        //this branch would be removed before release
        switch (body.error_code) {
          case ServerExceptionCode.LengthOverRun:
            !service.errCustomized && error(errMsgs.LengthOverRun);
            break;
          case ServerExceptionCode.NotFound:
            !service.errCustomized && error(errMsgs.NotFound);
            break;
          case ServerExceptionCode.InvalidGrant:
            !service.errCustomized && error(errMsgs.InvalidGrant);
            break;
          case ServerExceptionCode.TargetIsNullException:
            !service.errCustomized && error(errMsgs.TargetIsNullException);
            break;
          case ServerExceptionCode.TargetDisabledException:
            !service.errCustomized && error(errMsgs.TargetDisabledException);
            break;
          case ServerExceptionCode.TargetHasExistedException:
            !service.errCustomized && error(errMsgs.TargetHasExistedException);
            break;
          case ServerExceptionCode.NoPermissionException:
            !service.errCustomized && error(errMsgs.NoPermissionException);
            break;
          case ServerExceptionCode.ArgumentIsNullOrInvalidException:
            !service.errCustomized &&
              error(errMsgs.ArgumentIsNullOrInvalidException);
            break;
          case ServerExceptionCode.AggregateException:
            !service.errCustomized && error(errMsgs.AggregateException);
            break;
          case ServerExceptionCode.StrongAssociationException:
            !service.errCustomized && error(errMsgs.StrongAssociationException);
            break;
          case ServerExceptionCode.CodeHasBeenUsedException:
            !service.errCustomized && error(errMsgs.CodeHasBeenUsedException);
            break;
          case ServerExceptionCode.InvitationCodeNotExistException:
            !service.errCustomized &&
              error(errMsgs.InvitationCodeNotExistException);
            break;
          case ServerExceptionCode.UnsuportedOperationException:
            !service.errCustomized &&
              error(errMsgs.UnsuportedOperationException);
            break;
          case ServerExceptionCode.UnknownException:
            !service.errCustomized && error(errMsgs.UnknownException);
            break;
          default:
            break;
        }
      }
    }
    throw { isError: true, ...body, ...resp };
  };
}

export interface IGLService {
  getItemsBy(data: GLPagingRequest): Promise<GLPagingResponse>;
  get(data: GLRequest): Promise<GLResponse>;
  delete(data: GLRequest): Promise<GLResponse>;
  create(data: GLRequest): Promise<GLResponse>;
  update(data: GLRequest): Promise<GLResponse>;
  merge(data: GLMergeDoc[] | any): Promise<GLResponse>;
  getBlob(data: GLRequest): Promise<GLResponse>;
}
export interface ITGLService<
  TRequest extends GLRequest,
  TPageReuest extends GLPagingRequest
> extends IGLService {
  getItemsBy<TResp = GLPagingResponse, TReq = TPageReuest>(
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  getItemsBy<TResp = GLPagingResponse, TReq = TPageReuest>(
    suffix: string,
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;

  get<TResp = GLResponse, TReq = object | TRequest>(
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  get<TResp = GLResponse, TReq = object | TRequest>(
    suffix: string,
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;

  delete<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  delete<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp>;

  create<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  create<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  create<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object,
    requestOptions?: GLRequestParam<TReq>,
    options?: ServiceOptions
  ): Promise<TResp>;
  createMultipart<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object,
    requestOptions?: GLRequestParam<TReq>,
    options?: ServiceOptions
  ): Promise<TResp>;

  createWithoutLoader<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  createWithoutLoader<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object
  ): Promise<TResp>;

  update<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  update<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp>;

  merge<TResp = GLResponse, TReq = GLMergeDoc[] | any>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  merge<TResp = GLResponse, TReq = GLMergeDoc[] | any>(
    suffix: string,
    data: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp>;

  getBlob<TResp = GLResponse, TReq = object | TRequest>(
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  getBlob<TResp = GLResponse, TReq = object | TRequest>(
    suffix: string,
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;

  download<TResp = GLResponse, TReq = object | TRequest>({
    suffix,
    data,
    routeData,
    method,
  }: {
    suffix?: string;
    data?: TReq;
    routeData?: object;
    method?: string;
  }): Promise<TResp>;
}
export interface ServiceRoute {
  origin?: string;
  prefix: string;
  suffix?: string;
  itemSuffix?: string;
}

export abstract class GLServiceBase<
  TRequest extends GLRequest,
  TPageReuest extends GLPagingRequest
> implements ITGLService<TRequest, TPageReuest> {
  request: ITGLRequest<GLRequest, GLResponse> = new GLRequestProxy<
    GLRequest,
    GLResponse
  >();
  abstract serviceRoute: ServiceRoute;
  errMsgs: any;
  errCustomized = false;

  selectOrigin() {
    return (
      (this.serviceRoute.origin &&
        (GLGlobal.multipleApiPrefixes() as any)[this.serviceRoute.origin]) ||
      ""
    );
  }
  url(routeSuffix?: string) {
    if (routeSuffix && routeSuffix.startsWith("~")) {
      return routeSuffix.substr(1);
    }
    if (!this.serviceRoute || !this.serviceRoute.prefix) {
      throw "service url prefix is empty";
    }
    return `${this.selectOrigin()}${this.serviceRoute.prefix}${
      routeSuffix ? `/${routeSuffix}` : ""
    }`;
  }

  getReqParams<TReq>(
    suffix: string | TReq,
    data: TReq,
    routeData?: object,
    defaultSuffix?: string
  ) {
    return suffix && typeof suffix === "string"
      ? [this.url(suffix), data, routeData]
      : [
          this.url(
            data ? defaultSuffix || this.serviceRoute.itemSuffix : defaultSuffix
          ),
          suffix,
          data as any,
        ];
  }

  getItemsBy<TResp = GLPagingResponse, TReq = TPageReuest>(
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  getItemsBy<TResp = GLPagingResponse, TReq = TPageReuest>(
    suffix: string,
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  getItemsBy<TResp = GLPagingResponse, TReq = TPageReuest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(suffix, data, routeData);
    return this.request
      .get<TResp>(suffix as string, data, routeData)
      .catch(customError(this, HttpMethod.Get));
  }

  get<TResp = GLResponse, TReq = object | TRequest>(
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  get<TResp = GLResponse, TReq = object | TRequest>(
    suffix: string,
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  get<TResp = GLResponse, TReq = object | TRequest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(
      suffix,
      data,
      routeData,
      this.serviceRoute.suffix
    );
    return this.request
      .get<TResp>(suffix as string, data, routeData)
      .catch(customError(this, HttpMethod.Get));
  }

  delete<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  delete<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp>;
  delete<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(
      suffix,
      data,
      routeData,
      this.serviceRoute.suffix
    );
    const needLoader = getNeedLoader(options || {});
    needLoader(maskThrottle)();
    return this.request
      .del<TResp>(suffix as string, data, routeData)
      .then(needLoader(unmaskThrottle))
      .catch(customError(this, HttpMethod.Delete));
  }

  create<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  create<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  create<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object,
    requestOptions?: GLRequestParam<TReq>,
    options?: ServiceOptions
  ): Promise<TResp>;
  create<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object,
    requestOptions?: GLRequestParam<TReq>,
    options?: ServiceOptions
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(suffix, data, routeData);
    const needLoader = getNeedLoader(options || {});
    needLoader(maskThrottle)();
    return this.request
      .post<TResp>(suffix as string, data, routeData, requestOptions)
      .then(needLoader(unmaskThrottle))
      .catch(customError(this, HttpMethod.Post, suffix as string));
  }
  createMultipart<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object,
    requestOptions?: GLRequestParam<TReq>,
    options?: ServiceOptions
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(suffix, data, routeData);
    const needLoader = getNeedLoader(options || {});
    needLoader(maskThrottle)();
    return this.request
      .postMultipart<TResp>(suffix as string, data, routeData, requestOptions)
      .then(needLoader(unmaskThrottle))
      .catch(customError(this, HttpMethod.Post, suffix as string));
  }

  createWithoutLoader<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  createWithoutLoader<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  createWithoutLoader<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(suffix, data, routeData);
    return this.request
      .post<TResp>(suffix as string, data, routeData)
      .catch(customError(this, HttpMethod.Post, suffix as string));
  }

  update<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  update<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string,
    data: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp>;
  update<TResp = GLResponse, TReq = ObjectArray | TRequest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(
      suffix,
      data,
      routeData,
      this.serviceRoute.suffix
    );
    const needLoader = getNeedLoader(options || {});
    needLoader(maskThrottle)();
    return this.request
      .put<TResp>(suffix as string, data, routeData)
      .then(needLoader(unmaskThrottle))
      .catch(customError(this, HttpMethod.Put, suffix as string));
  }

  merge<TResp = GLResponse, TReq = GLMergeDoc[] | any>(
    data: TReq,
    routeData?: object
  ): Promise<TResp>;
  merge<TResp = GLResponse, TReq = GLMergeDoc[] | any>(
    suffix: string,
    data: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp>;
  merge<TResp = GLResponse, TReq = GLMergeDoc[] | any>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object,
    options?: ServiceOptions
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(
      suffix,
      data,
      routeData,
      this.serviceRoute.suffix
    );
    const needLoader = getNeedLoader(options || {});
    needLoader(maskThrottle)();
    return this.request
      .merge<TResp>(suffix as string, data, routeData)
      .then(needLoader(unmaskThrottle))
      .catch(customError(this, HttpMethod.Patch, suffix as string));
  }

  getBlob<TResp = GLResponse, TReq = object | TRequest>(
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  getBlob<TResp = GLResponse, TReq = object | TRequest>(
    suffix: string,
    data?: TReq,
    routeData?: object
  ): Promise<TResp>;
  getBlob<TResp = GLResponse, TReq = object | TRequest>(
    suffix: string | TReq,
    data?: TReq,
    routeData?: object
  ): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(
      suffix,
      data,
      routeData,
      this.serviceRoute.suffix
    );
    return this.request
      .getBlob<TResp>(suffix as string, data, routeData)
      .catch(customError(this, HttpMethod.Get));
  }

  download<TResp = GLResponse, TReq = object | TRequest>({
    suffix,
    data,
    routeData,
    method,
  }: {
    suffix?: string;
    data?: TReq;
    routeData?: object;
    method?: string;
  }): Promise<TResp> {
    [suffix, data, routeData] = this.getReqParams(
      suffix,
      data,
      routeData,
      this.serviceRoute.suffix
    );
    method && method !== "get" && maskThrottle();
    return this.request
      .download<any>({ url: suffix, data, routeData, method })
      .then(unmaskThrottle)
      .catch(customError(this, method as HttpMethod, suffix as string));
  }

  static proxy<T = any>(type: any): T {
    return SimplyProxy(new type(), {
      get: (target: any, key: any) =>
        typeof target[key] === "function"
          ? target[key].bind(target)
          : target[key],
    }) as any;
  }
}
