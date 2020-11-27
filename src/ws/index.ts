import { AuthService, GLGlobal } from "@/commonui";
import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";

export interface RTSocketOptions {
  url: string;
}

export class RTSocketClient {
  private _hubConnection?: HubConnection;
  private _options?: RTSocketOptions;

  constructor(options: RTSocketOptions) {
    this._options = options;
  }

  get hubConnection(): HubConnection {
    return this._hubConnection as HubConnection;
  }
  get options(): RTSocketOptions {
    return this._options as RTSocketOptions;
  }

  init() {
    const options = {
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      logging: LogLevel.Trace,
      accessTokenFactory: () => GLGlobal.loginInfo().access_token,
    };

    this._hubConnection = new HubConnectionBuilder()
      .withUrl(this.options.url, options)
      .configureLogging(LogLevel.Debug)
      .build();
  }

  async connect() {
    return this.hubConnection.start();
  }
  
  sendRequestJoinClass(roomId: string) {
    console.log("sendRequestJoinClass", roomId);
    this.hubConnection.send("TeacherJoinClass", {
      roomId: roomId,
    });
  }
}
