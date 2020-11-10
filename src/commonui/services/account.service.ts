import { GLServiceBase, ServiceRoute } from "./service";

class AccountService extends GLServiceBase<any, any> {
  serviceRoute: ServiceRoute = {
    prefix: "account/v1/users",
    itemSuffix: "{id}",
  };
  getUserAvatarUrl(id: string, expirationminutes?: number) {
    return this.get("{id}/getuseravatarsasuri/{expirationminutes}", null, {
      id,
      expirationminutes,
    });
  }
}

export default new AccountService();
