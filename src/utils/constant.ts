/**
 * Whenever the microphone of user is on, the level > 0, even they doesn't speak anything (the sound come from outside such as keyboard, phone-ring...)
 * so to make sure they are speaking, we check by a minimum level (actually this way doesn't make the exactly result)
 */
export const MIN_SPEAKING_LEVEL = 1;
