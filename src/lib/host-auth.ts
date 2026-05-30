"use client";

export const HOST_ACCESS_KEY = "party-network-host-access";
export const HOST_LOGIN_PATH = "/host-login";
export const HOST_PIN = "1234";

export function hasHostAccess() {
  return sessionStorage.getItem(HOST_ACCESS_KEY) === "granted";
}

export function grantHostAccess() {
  sessionStorage.setItem(HOST_ACCESS_KEY, "granted");
}

export function clearHostAccess() {
  sessionStorage.removeItem(HOST_ACCESS_KEY);
}
