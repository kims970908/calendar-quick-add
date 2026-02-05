import { DEFAULTS, STORAGE_KEYS } from "../shared/constants.js";

const CALENDAR_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

function getSettings() {
  return chrome.storage.sync.get({
    [STORAGE_KEYS.defaultStartTime]: DEFAULTS.defaultStartTime,
    [STORAGE_KEYS.defaultDurationMinutes]: DEFAULTS.defaultDurationMinutes,
    [STORAGE_KEYS.allowMmddParsing]: DEFAULTS.allowMmddParsing
  });
}

function getAuthToken(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError || new Error("Token unavailable"));
        return;
      }
      resolve(token);
    });
  });
}

function removeCachedToken(token) {
  return new Promise((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, () => resolve());
  });
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function addMinutes(dateStr, timeStr, minutes) {
  const date = new Date(`${dateStr}T${timeStr}:00`);
  date.setMinutes(date.getMinutes() + minutes);
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:00`;
}

function buildEvent(payload, timeZone, settings) {
  if (payload.allDay) {
    const endDate = addDays(payload.date, 1);
    return {
      summary: payload.title,
      description: payload.description || "",
      start: { date: payload.date },
      end: { date: endDate }
    };
  }

  const startTime = payload.startTime || settings[STORAGE_KEYS.defaultStartTime];
  const durationMinutes = Number(payload.durationMinutes) || settings[STORAGE_KEYS.defaultDurationMinutes];
  const startDateTime = `${payload.date}T${startTime}:00`;
  const endDateTime = addMinutes(payload.date, startTime, durationMinutes);

  return {
    summary: payload.title,
    description: payload.description || "",
    start: {
      dateTime: startDateTime,
      timeZone
    },
    end: {
      dateTime: endDateTime,
      timeZone
    }
  };
}

async function createEvent(payload) {
  const settings = await getSettings();
  const timeZone = DEFAULTS.timeZone;
  let token = null;

  try {
    token = await getAuthToken(false);
  } catch (err) {
    token = await getAuthToken(true);
  }

  const eventBody = buildEvent(payload, timeZone, settings);

  let response = await fetch(CALENDAR_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(eventBody)
  });

  if (response.status === 401) {
    await removeCachedToken(token);
    const newToken = await getAuthToken(true);
    response = await fetch(CALENDAR_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(eventBody)
    });
  }

  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail = data?.error?.message || "";
    } catch (err) {
      detail = "";
    }
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "CREATE_EVENT") return;
  (async () => {
    try {
      const data = await createEvent(message.payload);
      sendResponse({ ok: true, eventId: data?.id || null });
    } catch (err) {
      sendResponse({ ok: false, error: err?.message || "Failed to create event" });
    }
  })();
  return true;
});
