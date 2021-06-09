import { ref } from "vue";

export const useTimer = () => {
  let currentTimer = 180;
  let ticker: any;

  const formatTime = (seconds: number) => {
    const measuredTime = new Date(0);
    measuredTime.setSeconds(seconds);
    const MHSTime = measuredTime.toISOString().substr(14, 5);
    return MHSTime;
  };
  const formattedTime = ref<string>("03:00");
  const timerState = ref<string>("stopped");
  const tick = (initialTime: number) => {
    currentTimer = currentTimer - initialTime;
    ticker = setInterval(() => {
      currentTimer--;
      formattedTime.value = formatTime(currentTimer);
    }, 1000);
  };

  const start = (initialTime = 0) => {
    if (timerState.value !== "running") {
      tick(initialTime);
      timerState.value = "running";
    }
  };

  const pause = () => {
    clearInterval(ticker);
    timerState.value = "paused";
  };

  const stop = () => {
    window.clearInterval(ticker);
    currentTimer = 180;
    formattedTime.value = "03:00";
    timerState.value = "stopped";
  };
  return {
    start,
    pause,
    stop,
    formattedTime,
  };
};
