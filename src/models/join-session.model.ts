import { VCPlatform } from "@/store/app/state";

export interface JoinSessionModel {
  classId: string;
  groupId: string;
  resolution: string;
  unit: number;
  lesson: number;
  browserFingerprint: string;
  unitId: number;
  videoPlatformProvider?: VCPlatform;
}
