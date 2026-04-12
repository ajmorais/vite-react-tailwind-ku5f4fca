import { APPS_SCRIPT_URL } from '../config/constants';

export function postToAppsScript(payload) {
  if (!APPS_SCRIPT_URL.includes('script.google.com')) return Promise.resolve();
  return fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
