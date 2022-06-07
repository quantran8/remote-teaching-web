import { GLServiceBase } from "vue-glcommonui";

export class AdminService extends GLServiceBase<any, any> {
  serviceRoute: any = { prefix: "admin/v1" };
}
