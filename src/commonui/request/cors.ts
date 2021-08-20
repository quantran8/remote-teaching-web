import { Logger } from "@/utils/logger";

export class CorsProvider {
  static iframe: any;
  static requests: any = {};
  static ready = false;
  static buildFrame(host: any) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("style", "display:none;");
    iframe.src = host + "cors/index.html";
    document.body.appendChild(iframe);
    return iframe;
  }
  static getMsgId(): any {
    const id = Math.floor(Math.random() * 1000);
    return CorsProvider.requests[id] ? CorsProvider.getMsgId() : id;
  }
  static onMessage(evt: any) {
    if (!CorsProvider.iframe || evt.source !== CorsProvider.iframe.contentWindow) {
      return;
    }
    try {
      const data = JSON.parse(evt.data);
      if (data.type === "ready") {
        CorsProvider.ready = true;
        Object.getOwnPropertyNames(CorsProvider.requests).forEach(key => {
          const req = CorsProvider.requests[key];
          CorsProvider.send(req.msg);
        });
        return;
      }
      const req = CorsProvider.requests[data.id];
      if (!req) {
        return;
      }

      req.callback.call(req.msg._this, data.err, data.res);
      delete CorsProvider.requests[data.id];
    } catch (error) {
      Logger.log(error);
    }
  }
  static send(msg: any) {
    if (!CorsProvider.ready) {
      return false;
    }
    CorsProvider.iframe.contentWindow.postMessage(
      JSON.stringify({
        origin: process.env.VUE_APP_PORTAL_DOMAIN,
        id: msg.id,
        data: msg,
      }),
      process.env.VUE_APP_API_PREFIX,
    );
  }
  static buildRequestProxy() {
    CorsProvider.iframe || window.addEventListener("message", CorsProvider.onMessage);
    CorsProvider.iframe = CorsProvider.iframe || CorsProvider.buildFrame(process.env.VUE_APP_API_PREFIX);
  }
}

CorsProvider.buildRequestProxy();

export default function corsProxy(params?: any) {
  return (req: any) => {
    req.end = function(fn: any) {
      const callback =
        fn ||
        function() {
          Logger.log("proxy");
        };
      const msg = {
        id: CorsProvider.getMsgId(),
        method: this.method,
        url: this.url,
        query: this._query,
        timeout: this._timeout,
        data: this._data,
        header: this.header,
        ...params,
        _this: this,
      };
      CorsProvider.requests[msg.id] = {
        callback,
        msg,
      };
      CorsProvider.send(msg);
    };
    return req;
  };
}

export function corsMultipartProxy(params?: any) {
  return (req: any) => {
    req.end = function(fn: any) {
      const callback =
        fn ||
        function() {
          Logger.log("multi proxy");
        };
      const msg = {
        id: CorsProvider.getMsgId(),
        method: this.method,
        url: this.url,
        query: this._query,
        timeout: this._timeout,
        data: this._getMultipartFormData && this._getMultipartFormData(),
        header: this.header,
        ...params,
        _this: this,
      };
      CorsProvider.requests[msg.id] = {
        callback,
        msg,
      };

      CorsProvider.send(msg);
    };

    return req;
  };
}
