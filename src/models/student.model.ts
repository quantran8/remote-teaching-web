import { UserModel } from './user.model';

export interface StudentModel extends UserModel {
  id: string;
  name: string;
  englishName: string;
  updateTime: any;
  subscriptionType: number;
  zoomId?: string;
  signalrConnectId?: string;
  signature: string;
  isLeave: boolean;
}
