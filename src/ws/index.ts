import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";

const hubConnectionOptions = {
  skipNegotiation: true,
  transport: HttpTransportType.WebSockets,
  logging: LogLevel.Trace,
  accessTokenFactory: function() {
    // access_token here
    return "eyJhbGciOiJSUzI1NiIsImtpZCI6IkFFNEExNUQ5MEY0MDRFQUFFOUE5MkYxMTkxQzJFN0Q5RjEzRTBERDAiLCJ0eXAiOiJhdCtqd3QiLCJ4NXQiOiJya29WMlE5QVRxcnBxUzhSa2NMbjJmRS1EZEEifQ.eyJuYmYiOjE2MDUxNjgwMjgsImV4cCI6MTYwNTE3NTIyOCwiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo1MDAwIiwiYXVkIjoiYmFzaWNpbmZvIiwiY2xpZW50X2lkIjoiZ3JhcGVzZWVkLnJlbW90ZXRlYWNoaW5nLndlYiIsInN1YiI6ImQ5NjA0MjBlLTliZWMtNGRhNi1iOGNhLThiN2QxYWMxYzg3YSIsImF1dGhfdGltZSI6MTYwNTE1NjY0MCwiaWRwIjoibG9jYWwiLCJlbWFpbCI6ImdpbmEuZ3JhcGVjaXR5K3BhcmVudFRlc3QzQGdtYWlsLmNvbSIsIm5hbWUiOiJQYXJlbnRUZXN0MyIsImZyb20iOiJHTEFTIiwidXNlcl9ub3RpZmljYXRpb25zIjoiW10iLCJyb2xlaW5mb3MiOiJbe1wiSWRcIjpcImM4NTc3YjU0LTY1MGEtNDgwZi04ZTE3LTVkOWM4Yzc0MzljNlwiLFwiTmFtZVwiOlwiUGFyZW50XCJ9XSIsInJvbGUiOiJQYXJlbnQiLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiYmFzaWNpbmZvIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.eiq2xNZJBjXdM0iYRsoz3oxdP61kqzt5GALCh6gVm89P5BE01gziEXsTjBH97sujbirzkFYX3wjLc0ygXAfHHmT6-ykaIIVFiKfPRlHR-WaZEmLEAXzU0F2RjiZUIFmINSoyZLDqEqraeKtD0X_qEAHXlXuF-GO62BM53Th7qX2mBp_PX7zmGIURdYK--cxGzAtR7Ux0GNrKbAAqp1O9J9ZGRqY4Q6gu8dHh7l-ZhW3kGRQwLmCvNscRLh5di6-I9k4OftTBvWrVUzyfLjC3vCllLALYtTqLBYd5EOJCCLfPY4zV8C3H39BUTQGOc5jHuqOFr58g3QG0LUg6-eKBvA";
  },
};

const hubConnection = new HubConnectionBuilder()
  .withUrl(`http://127.0.0.1:5010/teaching`, hubConnectionOptions)
  // .withHubProtocol(new protocols.MessagePackHubProtocol())
  .configureLogging(LogLevel.Debug) // set loggingg level here
  .build();

let connectionRetryAttempt = 0;

export function startHub() {
  hubConnection
    .start()
    .catch(function() {
      connectionRetryAttempt++;
      const sleepDuration =
        1000 *
        (connectionRetryAttempt > 5 ? 60 : Math.pow(2, connectionRetryAttempt));
      setTimeout(() => startHub(), sleepDuration);
    })
    .then(() => {
      // hubConnection.invoke('JoinGroup', 'ResourceTrackers');
    });
}

hubConnection.on("ResourceUpdated", (data) => {
  console.log("WS", JSON.stringify(data));
});
hubConnection.onclose(() => {
  startHub();
});

export default hubConnection;
