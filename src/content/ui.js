function createInput({ label, type, id, icon }) {
  const wrapper = document.createElement("div");
  wrapper.className = "gcal-field";

  const labelEl = document.createElement("label");
  labelEl.textContent = label;
  labelEl.setAttribute("for", id);

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "gcal-input-wrapper";

  if (icon) {
    const iconEl = document.createElement("span");
    iconEl.className = "gcal-icon";
    iconEl.textContent = icon;
    inputWrapper.appendChild(iconEl);
  }

  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.className = icon ? "with-icon" : "";

  inputWrapper.appendChild(input);
  wrapper.appendChild(labelEl);
  wrapper.appendChild(inputWrapper);
  return { wrapper, input };
}

function createUI() {
  const container = document.createElement("div");
  container.id = "gcal-quick-add";
  container.style.display = "none";

  const header = document.createElement("div");
  header.className = "gcal-header";
  
  const title = document.createElement("h3");
  title.innerHTML = '📅 <span>Google 캘린더 저장</span>';
  header.appendChild(title);
  
  container.appendChild(header);

  const warning = document.createElement("div");
  warning.className = "gcal-warning";
  warning.style.display = "none";
  container.appendChild(warning);

  const status = document.createElement("div");
  status.className = "gcal-status";
  status.style.display = "none";
  container.appendChild(status);

  const dateField = createInput({ label: "날짜", type: "text", id: "gcal-date", icon: "📅" });
  const titleField = createInput({ label: "제목", type: "text", id: "gcal-title", icon: "✏️" });
  dateField.input.placeholder = "YYYY-MM-DD";
  const startTimeField = createInput({ label: "시작 시간", type: "time", id: "gcal-start", icon: "🕐" });
  const endTimeField = createInput({ label: "종료 시간", type: "time", id: "gcal-end", icon: "🕐" });

  const descWrapper = document.createElement("div");
  descWrapper.className = "gcal-field";
  const descLabel = document.createElement("label");
  descLabel.innerHTML = "📝 메모";
  descLabel.setAttribute("for", "gcal-desc");
  const desc = document.createElement("textarea");
  desc.id = "gcal-desc";
  desc.placeholder = "일정에 대한 추가 정보를 입력하세요...";
  descWrapper.appendChild(descLabel);
  descWrapper.appendChild(desc);

  container.appendChild(dateField.wrapper);
  container.appendChild(titleField.wrapper);
  container.appendChild(startTimeField.wrapper);
  container.appendChild(endTimeField.wrapper);
  container.appendChild(descWrapper);

  const actions = document.createElement("div");
  actions.className = "gcal-actions";
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.innerHTML = '<span class="btn-icon">✓</span> 저장';
  saveBtn.className = "gcal-primary";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.innerHTML = '<span class="btn-icon">✕</span> 취소';
  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);
  container.appendChild(actions);

  function showAt(x, y) {
    container.style.left = `${Math.max(8, x)}px`;
    container.style.top = `${Math.max(8, y)}px`;
    container.style.display = "block";
  }

  function hide() {
    container.style.display = "none";
    status.style.display = "none";
    warning.style.display = "none";
  }

  function setWarning(message) {
    if (!message) {
      warning.style.display = "none";
      warning.textContent = "";
      return;
    }
    warning.textContent = message;
    warning.style.display = "block";
  }

  function setStatus(message, isError = false) {
    if (!message) {
      status.style.display = "none";
      status.textContent = "";
      status.classList.remove("error");
      return;
    }
    status.textContent = message;
    status.style.display = "block";
    status.classList.toggle("error", isError);
  }

  function setDate(date) {
    if (!date) {
      dateField.input.value = "";
      return;
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    dateField.input.value = `${yyyy}-${mm}-${dd}`;
    dateField.input.placeholder = "YYYY-MM-DD";
  }

  return {
    container,
    inputs: {
      date: dateField.input,
      title: titleField.input,
      startTime: startTimeField.input,
      endTime: endTimeField.input,
      description: desc
    },
    buttons: { saveBtn, cancelBtn },
    showAt,
    hide,
    setWarning,
    setStatus,
    setDate
  };
}

window.gcalCreateUI = createUI;
