import { AccountService } from "../account.service";
class GLInfoService extends AccountService {
  getAvatarTeacher(teacherId: string): Promise<any> {
    const expirationminutes = 120;
    return this.get(`users/${teacherId}/getuseravatarsasuri/${expirationminutes}`);
  }
}

export const InfoService = new GLInfoService();
