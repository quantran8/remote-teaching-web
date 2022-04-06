import { GLServiceBase } from "vue-glcommonui";

export class AccountService extends GLServiceBase<any, any> {
  serviceRoute = { prefix: "account/v1" };
}
