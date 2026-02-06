import { DEFAULTS, STORAGE_KEYS } from "../shared/constants.js";

const enabledInput = document.getElementById("enabled");
const startTimeInput = document.getElementById("startTime");
const durationInput = document.getElementById("duration");
const allowMmddInput = document.getElementById("allowMmdd");
const statusEl = document.getElementById("status");
const saveBtn = document.getElementById("save");

function loadSettings() {
  chrome.storage.sync.get({
    [STORAGE_KEYS.defaultStartTime]: DEFAULTS.defaultStartTime,
    [STORAGE_KEYS.defaultDurationMinutes]: DEFAULTS.defaultDurationMinutes,
    [STORAGE_KEYS.allowMmddParsing]: DEFAULTS.allowMmddParsing,
    [STORAGE_KEYS.enabled]: DEFAULTS.enabled
  }, (items) => {
    startTimeInput.value = items[STORAGE_KEYS.defaultStartTime];
    durationInput.value = items[STORAGE_KEYS.defaultDurationMinutes];
    allowMmddInput.checked = items[STORAGE_KEYS.allowMmddParsing];
    enabledInput.checked = items[STORAGE_KEYS.enabled];
  });
}

function saveSettings() {
  const payload = {
    [STORAGE_KEYS.defaultStartTime]: startTimeInput.value || DEFAULTS.defaultStartTime,
    [STORAGE_KEYS.defaultDurationMinutes]: Number(durationInput.value) || DEFAULTS.defaultDurationMinutes,
    [STORAGE_KEYS.allowMmddParsing]: allowMmddInput.checked,
    [STORAGE_KEYS.enabled]: enabledInput.checked
  };

  chrome.storage.sync.set(payload, () => {
    statusEl.textContent = "저장되었습니다.";
    setTimeout(() => {
      statusEl.textContent = "";
    }, 1500);
  });
}

saveBtn.addEventListener("click", saveSettings);

loadSettings();
