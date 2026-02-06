const STORAGE_KEYS = {
  defaultStartTime: "defaultStartTime",
  defaultDurationMinutes: "defaultDurationMinutes",
  allowMmddParsing: "allowMmddParsing"
};

const DEFAULTS = {
  defaultStartTime: "09:00",
  defaultDurationMinutes: 60,
  allowMmddParsing: true
};

const ui = window.gcalCreateUI();
document.documentElement.appendChild(ui.container);

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      [STORAGE_KEYS.defaultStartTime]: DEFAULTS.defaultStartTime,
      [STORAGE_KEYS.defaultDurationMinutes]: DEFAULTS.defaultDurationMinutes,
      [STORAGE_KEYS.allowMmddParsing]: DEFAULTS.allowMmddParsing
    }, (items) => resolve(items));
  });
}

function getSelectionRect() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return null;
  return rect;
}

function isInsideUI(target) {
  return ui.container.contains(target);
}

function tryNormalizeSelectionToMatch(selection, matchedText) {
  if (!selection || !matchedText) return;
  if (selection.rangeCount !== 1) return;
  const range = selection.getRangeAt(0);
  if (range.startContainer !== range.endContainer) return;
  if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

  const selectedText = selection.toString();
  const index = selectedText.indexOf(matchedText);
  if (index < 0) return;

  const start = range.startOffset + index;
  const end = start + matchedText.length;
  const newRange = document.createRange();
  newRange.setStart(range.startContainer, start);
  newRange.setEnd(range.startContainer, end);
  selection.removeAllRanges();
  selection.addRange(newRange);
}


async function handleMouseUp(event) {
  if (isInsideUI(event.target)) return;
  const selection = window.getSelection();
  const text = selection ? selection.toString() : "";
  if (!text || !text.trim()) return;

  const settings = await getSettings();
  const allowMmdd = settings?.[STORAGE_KEYS.allowMmddParsing] ?? DEFAULTS.allowMmddParsing;
  const parsed = typeof window.gcalParseDate === "function"
    ? window.gcalParseDate(text, allowMmdd)
    : null;

  if (!parsed) return;

  tryNormalizeSelectionToMatch(selection, parsed.matchedText);

  ui.setStatus("");
  ui.setWarning("");
  ui.setDate(parsed.date);
  
  // URL을 메모(description)에 미리 채워넣음
  ui.inputs.description.value = `URL: ${window.location.href}`;

  const rect = getSelectionRect();
  if (rect) {
    ui.showAt(rect.left + window.scrollX, rect.bottom + window.scrollY + 8);
  } else {
    ui.showAt(window.scrollX + 16, window.scrollY + 16);
  }
}


function normalizeDateString(value) {
  const trimmed = (value || "").trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() != year || date.getMonth() != month - 1 || date.getDate() != day) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

async function handleSave() {
  const settings = await getSettings();
  const dateInput = ui.inputs.date.value;
  const date = normalizeDateString(dateInput);
  const title = ui.inputs.title.value.trim();
  const rawStartTime = ui.inputs.startTime.value.trim();
  const rawEndTime = ui.inputs.endTime.value.trim();
  const allDay = !rawStartTime && !rawEndTime;
  const startTime = rawStartTime;
  let duration = null;
  if (rawEndTime && !rawStartTime) {
    ui.setWarning("시작 시간을 먼저 입력해 주세요.");
    return;
  }
  if (!allDay) {
    if (rawEndTime) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = rawEndTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      duration = endMinutes - startMinutes;
      if (duration <= 0) {
        ui.setWarning("종료 시간은 시작 시간보다 늦어야 합니다.");
        return;
      }
    } else {
      duration = settings?.[STORAGE_KEYS.defaultDurationMinutes] || DEFAULTS.defaultDurationMinutes;
    }
  }
  const description = ui.inputs.description.value.trim();

  if (!date) {
    ui.setWarning("날짜는 YYYY-MM-DD 형식이어야 합니다.");
    return;
  }
  if (!title) {
    ui.setWarning("제목은 필수입니다.");
    return;
  }

  ui.setWarning("");
  ui.setStatus("저장 중...");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "CREATE_EVENT",
      payload: {
        date,
        title,
        startTime,
        durationMinutes: duration,
        allDay,
        description
      }
    });

    if (response && response.ok) {
      ui.setStatus("일정이 저장되었습니다.");
      setTimeout(() => {
        resetForm();
        ui.hide();
      }, 800);
    } else {
      ui.setStatus(response?.error || "일정 저장에 실패했습니다.", true);
    }
  } catch (err) {
    ui.setStatus("일정 저장에 실패했습니다.", true);
  }
}

function resetForm() {
  ui.inputs.date.value = "";
  ui.inputs.title.value = "";
  ui.inputs.startTime.value = "";
  ui.inputs.endTime.value = "";
  ui.inputs.duration.value = "";
  ui.inputs.description.value = "";
  ui.setStatus("");
  ui.setWarning("");
}

function isUiVisible() {
  return ui.container.style.display !== "none";
}

function handleCancel() {
  resetForm();
  ui.hide();
}

ui.buttons.saveBtn.addEventListener("click", handleSave);
ui.buttons.cancelBtn.addEventListener("click", handleCancel);

document.addEventListener("mouseup", handleMouseUp);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isUiVisible()) {
    handleCancel();
  }
});
