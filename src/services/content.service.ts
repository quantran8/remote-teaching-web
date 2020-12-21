import { GLServiceBase, ServiceRoute } from "./base.service";

export class GLContentService extends GLServiceBase<any, any> {
  serviceRoute: ServiceRoute = { prefix: "content/v1" };

  getSASUrl(): Promise<{ pageContainer: string }> {
    const versionId = "00000000-0000-0000-0000-000000000000";
    const contentSignatureUrl = `versions/${versionId}/contents/contentsignature`;
    return this.get(contentSignatureUrl);
  }
}

export const ContentService = new GLContentService();
