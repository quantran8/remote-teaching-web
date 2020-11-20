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
    return "eyJhbGciOiJSUzI1NiIsImtpZCI6IkFFNEExNUQ5MEY0MDRFQUFFOUE5MkYxMTkxQzJFN0Q5RjEzRTBERDAiLCJ0eXAiOiJhdCtqd3QiLCJ4NXQiOiJya29WMlE5QVRxcnBxUzhSa2NMbjJmRS1EZEEifQ.eyJuYmYiOjE2MDU4NTY4MzMsImV4cCI6MTYwNTg2NDAzMywiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo1MDAwIiwiYXVkIjoiYmFzaWNpbmZvIiwiY2xpZW50X2lkIjoiZ3JhcGVzZWVkLnJlbW90ZXRlYWNoaW5nLndlYiIsInN1YiI6ImQ5NjA0MjBlLTliZWMtNGRhNi1iOGNhLThiN2QxYWMxYzg3YSIsImF1dGhfdGltZSI6MTYwNTc3NjM4NiwiaWRwIjoibG9jYWwiLCJlbWFpbCI6ImdpbmEuZ3JhcGVjaXR5K3BhcmVudFRlc3QzQGdtYWlsLmNvbSIsIm5hbWUiOiJQYXJlbnRUZXN0MyIsImZyb20iOiJHTEFTIiwidXNlcl9ub3RpZmljYXRpb25zIjoiW10iLCJyb2xlaW5mb3MiOiJbe1wiSWRcIjpcImM4NTc3YjU0LTY1MGEtNDgwZi04ZTE3LTVkOWM4Yzc0MzljNlwiLFwiTmFtZVwiOlwiUGFyZW50XCJ9XSIsInJvbGUiOiJQYXJlbnQiLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiYmFzaWNpbmZvIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.UVdlrEuxZbBiMMXRoiH1rPKNo9lDDJQt8O0xz_73Z1VtW5_I4NPtPAOUDLyKv_S0nGY4pZ6abatjrjCRMnjDfCm9LRcAueKmm1Bs53hspEW2owvNfZ-PK5RJq6eHnBcMMaAIT5B6ENslJbdmhh-M_35cWwYGKWJlkccq5g6PtZXTWDTsBFHInZQqSpEt9y9jl1Sr_B4rEQU2xNsqdq7dTYSEeZnM6OWu26rnb7jqsSGcCx_8Aha6aftRNOpE4-xGzlje7KiyhF_O5vtQf7k__qYlD9-zG4b62R7I34m9Qm9Qvnc9Tvolf7gjZmGWBUGnFSAlq1V9Xe6jExS-4z0uRg";
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
