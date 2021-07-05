export const API_URL = "/api/";
export const CACHE_URL =
  window.location.href.split("/").splice(-1)[0].split("-").length === 1
    ? false
    : true;
export const PARENT_URL = window.location === window.parent.location;
export const USING_PASSWORDS = "2scale";
export const SAVE_FEATURES = ["2scale", "seap"];
export const CAPTCHA_KEY = process.env.REACT_APP_CAPTCHA_KEY;
export const READ_CACHE =
  process.env.NODE_ENV === "development" ? "fetch" : "update";
