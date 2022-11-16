/**
 * Whenever the microphone of user is on, the level > 0, even they doesn't speak anything (the sound come from outside such as keyboard, phone-ring...)
 * so to make sure they are speaking, we check by a minimum level (actually this way doesn't make the exactly result)
 */
export const MIN_SPEAKING_LEVEL = 1;

export const NEXT_EXPOSURE = 1;
export const PREV_EXPOSURE = 2;
export const SESSION_MAXIMUM_IMAGE = 10;
export const MAX_ZOOM_RATIO = 4;
export const MIN_ZOOM_RATIO = 1;

const genLocalStorageKey = (key: string) => `__RT_${key}__`;

//localstorage key
export const CAMERA_ID_KEY = genLocalStorageKey("CAMERA_ID");
export const MICROPHONE_ID_KEY = genLocalStorageKey("MICROPHONE_ID");
export const I18N_LOCALE = genLocalStorageKey("I18N_LOCALE");
