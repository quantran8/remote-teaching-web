import { GLGlobal } from "@/commonui";
import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";

export interface GLSocketOptions {
  url: string;
}

export class GLSocketClient {
  private _hubConnection?: HubConnection;
  private _options?: GLSocketOptions;
  private _isConnected = false;
  constructor(options: GLSocketOptions) {
    this._options = options;
  }

  get hubConnection(): HubConnection {
    return this._hubConnection as HubConnection;
  }
  get options(): GLSocketOptions {
    return this._options as GLSocketOptions;
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
    this._isConnected = false;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect() {
    if (this.isConnected) return;
    return this.hubConnection
      .start()
      .then((res) => {
        this._isConnected = true;
        return res;
      })
      .catch((err) => {
        this._isConnected = false;
        return err;
      });
  }
  async send(command: string, payload: any) {
    if (!this.isConnected) return;
    return this.hubConnection.send(command, payload);
  }
}
