import { GLServiceBase } from "vue-glcommonui";

export class GLContentService extends GLServiceBase<any, any> {
  serviceRoute = { prefix: "content/v1" };

  getSASUrl(): Promise<{ pageContainer: string }> {
    const cacheTime = 60 * 5; //5 minutes
    const contentSignatureUrl = `versions/remote/contentsignature`;
    return this.get(contentSignatureUrl, { cacheTime });
  }
}

export const ContentService = new GLContentService();
