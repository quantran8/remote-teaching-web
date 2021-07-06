//The Media Status enum used to determine the status of camera and microphone (lock or unlock) to signalR
export enum MediaStatus {
  noStatus = 1, //not send the camera/microphone status to signalR
  mediaLocked = 2, // camera/microphone was locked
  mediaNotLocked = 3, // camera/microphone was unlocked
}
