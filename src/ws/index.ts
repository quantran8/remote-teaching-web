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
    return "eyJhbGciOiJSUzI1NiIsImtpZCI6IkFFNEExNUQ5MEY0MDRFQUFFOUE5MkYxMTkxQzJFN0Q5RjEzRTBERDAiLCJ0eXAiOiJhdCtqd3QiLCJ4NXQiOiJya29WMlE5QVRxcnBxUzhSa2NMbjJmRS1EZEEifQ.eyJuYmYiOjE2MDU3Njc3MTcsImV4cCI6MTYwNTc3NDkxNywiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo1MDAwIiwiYXVkIjoiYmFzaWNpbmZvIiwiY2xpZW50X2lkIjoiZ3JhcGVzZWVkLnJlbW90ZXRlYWNoaW5nLndlYiIsInN1YiI6IjliNDFiMGNjLWRjYmYtNDQ0Yy1hMzViLTA2YzhjOWUzODhjZCIsImF1dGhfdGltZSI6MTYwNTc1OTU5MCwiaWRwIjoibG9jYWwiLCJlbWFpbCI6ImdpbmEuZ3JhcGVjaXR5K3BhcmVudFRlc3QxQGdtYWlsLmNvbSIsIm5hbWUiOiJQYXJlbnRUZXN0MSIsImZyb20iOiJHTEFTIiwidXNlcl9ub3RpZmljYXRpb25zIjoiW10iLCJyb2xlaW5mb3MiOiJbe1wiSWRcIjpcImM4NTc3YjU0LTY1MGEtNDgwZi04ZTE3LTVkOWM4Yzc0MzljNlwiLFwiTmFtZVwiOlwiUGFyZW50XCJ9XSIsInJvbGUiOiJQYXJlbnQiLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiYmFzaWNpbmZvIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.Pg-32Cv8MYAjnY1EpwK4UXPlB9EnA3N9UYhR8Fl6d5Twp2NHS3rRe-V7sdtXfvhnvBXoNqXcQl_I-HhbzGA2_E6MWp3m-CBIH_jfv3pAABNOdaX2qWkNDK8hhr4sXlU5bCTcuCTixlhupZh0dW8g7o-GdoFJ09IY8sT_Js8qasdTao9G_7xzV2SzlS4GmlQ1F1IcR8n0sDsY1VbvoSdld2sApn8dWL5SpZzV5m9yqPKmB1l4GE0CQ3LJzGBDOgp94NSf-869r3mf5wqXnbkbZ0p4dI-YUgBpVfionoEIuZRQRUrN7fYNw3pjpEs0uoH8EqR2lXAeuJl6hv_5doAewg";
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
