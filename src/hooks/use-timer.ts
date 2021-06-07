import { ref } from "vue";

export const useTimer = () => {
  let currentTimer = 0;
  let ticker: any;

  const formatTime = (seconds: number) => {
    const measuredTime = new Date(0);
    measuredTime.setSeconds(seconds);
    const MHSTime = measuredTime.toISOString().substr(14, 5);
    return MHSTime;
  };
  const formattedTime = ref<string>("00:00");
  const timerState = ref<string>("stopped");
  const tick = () => {
    ticker = setInterval(() => {
      currentTimer++;
      formattedTime.value = formatTime(currentTimer);
    }, 1000);
  };

  const start = () => {
    if (timerState.value !== "running") {
      tick();
      timerState.value = "running";
    }
  };

  const pause = () => {
    clearInterval(ticker);
    timerState.value = "paused";
  };

  const stop = () => {
    window.clearInterval(ticker);
    currentTimer = 0;
    formattedTime.value = "00:00";
    timerState.value = "stopped";
  };
  return {
    start,
    pause,
    stop,
    formattedTime,
  };
};
