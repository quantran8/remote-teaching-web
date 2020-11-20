import { AuthService } from "@/commonui";
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
      accessTokenFactory: () => AuthService.accessToken || "",
    };

    this._hubConnection = new HubConnectionBuilder()
      .withUrl(this.options.url, options)
      .configureLogging(LogLevel.Debug)
      .build();
  }

  connect() {
    this.hubConnection
      .start()
      .catch((err) => {
        console.log("error", err);
      })
      .then((success) => {
        console.log("Success", success);
      });
    this.hubConnection.on("ResourceUpdated", (data) => {
      console.log("WS", JSON.stringify(data));
    });
    this.hubConnection.onclose(() => {
      console.log("onConnection Closed");
    });
  }
}

export const RTWSClient: RTSocketClient = new RTSocketClient({
  url: "http://127.0.0.1:5010/teaching",
});
