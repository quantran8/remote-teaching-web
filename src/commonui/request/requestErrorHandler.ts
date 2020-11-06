import * as request from "superagent";
import { ServerExceptionCode, MessageHelper, fmtMsg } from "../utils";
import { AuthService } from "../services";
import { CommonLocale } from "@/locales/localeid";

export interface IGLRequestErrorHandler {
	handler(response: request.Response, reject: any): void;
}

export class GLRequestErrorHandler implements IGLRequestErrorHandler {
	handler(response: request.Response, reject: any) {
		if (response.unauthorized) {
			this.unauthorized();
		} else if (response.badRequest) {
			this.badRequest(response);
		} else if (response.notFound) {
			this.errorMessage(CommonLocale.CommonHttpNotFound);
		} else if (response.status == ServerExceptionCode.TooManyRequest) {
			this.errorMessage(CommonLocale.CommonHttpTooManyRequest);
		} else if (response.serverError) {
			this.errorMessage(CommonLocale.CommonHttpServerError);
		}
		reject(response);
	}
	unauthorized() {
		AuthService.storePagethenSigninRedirect();
	}
	errorMessage(id: any) {
		const error = fmtMsg(id);
		MessageHelper.ShowError({ error: error, error_description: error, error_code: null! });
	}
	badRequest(response: any) {
		(response.body && response.body.error_code) || this.errorMessage(CommonLocale.CommonHttpBadRequest);
	}
}
