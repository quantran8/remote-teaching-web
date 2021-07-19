//The Media Status enum used to determine the status of camera and microphone (lock or unlock) to signalR
export enum MediaStatus {
  noStatus = 1, //not send the camera/microphone status to signalR
  mediaLocked = 2, // camera/microphone was locked
  mediaNotLocked = 3, // camera/microphone was unlocked
}

export enum SignalRStatus {
  NoStatus = 1, //the status which follow the flow of App
  Disconnected = 2, //the status when signalR disconnected
  Closed = 3, //the status when signalR destroyed
}

export enum ClassRoomStatus {
  InClass = 1, //the user (teacher/student) in a class
  InDashBoard = 2, //the user (teacher/student) in dashboard
}
