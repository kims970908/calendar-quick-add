function createInput({ label, type, id }) {
  const wrapper = document.createElement("div");
  wrapper.className = "gcal-field";

  const labelEl = document.createElement("label");
  labelEl.textContent = label;
  labelEl.setAttribute("for", id);

  const input = document.createElement("input");
  input.type = type;
  input.id = id;

  wrapper.appendChild(labelEl);
  wrapper.appendChild(input);
  return { wrapper, input };
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function createUI() {
  const container = document.createElement("div");
  container.id = "gcal-quick-add";
  container.style.display = "none";

  const title = document.createElement("h3");
  title.textContent = "Google 캘린더 저장";
  container.appendChild(title);

  const warning = document.createElement("div");
  warning.className = "gcal-warning";
  warning.style.display = "none";
  container.appendChild(warning);

  const status = document.createElement("div");
  status.className = "gcal-status";
  status.style.display = "none";
  container.appendChild(status);

  const dateField = createInput({ label: "날짜", type: "text", id: "gcal-date" });
  const titleField = createInput({ label: "제목", type: "text", id: "gcal-title" });
  const startTimeField = createInput({ label: "시작 시간", type: "time", id: "gcal-start" });
  const endTimeField = createInput({ label: "종료 시간", type: "time", id: "gcal-end" });
  const durationField = createInput({ label: "소요 시간(분)", type: "number", id: "gcal-duration" });
  durationField.input.min = "1";

  dateField.input.placeholder = "YYYY-MM-DD";

  const calendar = document.createElement("div");
  calendar.className = "gcal-calendar";
  calendar.style.display = "none";

  const calHeader = document.createElement("div");
  calHeader.className = "gcal-calendar-header";
  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.textContent = "❮";
  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.textContent = "❯";
  const calTitle = document.createElement("span");
  calTitle.className = "gcal-calendar-title";
  calHeader.appendChild(prevBtn);
  calHeader.appendChild(calTitle);
  calHeader.appendChild(nextBtn);

  const calGrid = document.createElement("div");
  calGrid.className = "gcal-calendar-grid";

  calendar.appendChild(calHeader);
  calendar.appendChild(calGrid);
  dateField.wrapper.appendChild(calendar);

  const descWrapper = document.createElement("div");
  descWrapper.className = "gcal-field";
  const descLabel = document.createElement("label");
  descLabel.textContent = "메모";
  descLabel.setAttribute("for", "gcal-desc");
  const desc = document.createElement("textarea");
  desc.id = "gcal-desc";
  desc.rows = 3;
  descWrapper.appendChild(descLabel);
  descWrapper.appendChild(desc);

  const body = document.createElement("div");
  body.className = "gcal-body";
  body.appendChild(dateField.wrapper);
  body.appendChild(titleField.wrapper);
  body.appendChild(startTimeField.wrapper);
  body.appendChild(endTimeField.wrapper);
  body.appendChild(durationField.wrapper);
  body.appendChild(descWrapper);
  container.appendChild(body);

  const actions = document.createElement("div");
  actions.className = "gcal-actions";
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "저장";
  saveBtn.className = "gcal-primary";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "취소";
  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);
  container.appendChild(actions);

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();

  function renderCalendar() {
    calTitle.textContent = `${currentYear}년 ${currentMonth + 1}월`;
    calGrid.innerHTML = "";

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    dayNames.forEach((name) => {
      const label = document.createElement("div");
      label.className = "gcal-calendar-dayname";
      label.textContent = name;
      calGrid.appendChild(label);
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i += 1) {
      const empty = document.createElement("div");
      empty.className = "gcal-calendar-empty";
      calGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gcal-calendar-day";
      btn.textContent = String(day);
      btn.addEventListener("click", () => {
        const date = new Date(currentYear, currentMonth, day);
        dateField.input.value = formatDate(date);
        calendar.style.display = "none";
      });
      calGrid.appendChild(btn);
    }
  }

  function showCalendar() {
    calendar.style.display = "block";
    renderCalendar();
    
    // 캘린더가 박스 하단을 넘어가는지 확인
    setTimeout(() => {
      const calendarRect = calendar.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const dateFieldRect = dateField.input.getBoundingClientRect();
      
      // 캘린더 하단이 박스 하단을 넘어가는 경우
      if (calendarRect.bottom > containerRect.bottom) {
        // 날짜 필드 위쪽에 표시
        calendar.style.top = "auto";
        calendar.style.bottom = `calc(100% - ${dateFieldRect.top - containerRect.top}px)`;
      } else {
        // 기본 위치 (아래쪽)
        calendar.style.top = "100%";
        calendar.style.bottom = "auto";
      }
    }, 0);
  }

  function hideCalendar() {
    calendar.style.display = "none";
  }

  prevBtn.addEventListener("click", () => {
    currentMonth -= 1;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear -= 1;
    }
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentMonth += 1;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear += 1;
    }
    renderCalendar();
  });

  dateField.input.addEventListener("focus", showCalendar);
  dateField.input.addEventListener("click", showCalendar);

  document.addEventListener("mousedown", (event) => {
    if (!dateField.wrapper.contains(event.target)) {
      hideCalendar();
    }
  });

  function showAt(x, y) {
    // 일단 display를 block으로 설정하여 크기를 측정할 수 있게 함
    container.style.display = "block";
    container.style.left = `${Math.max(8, x)}px`;
    container.style.top = `${Math.max(8, y)}px`;
    
    // UI의 실제 크기 측정
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    let finalX = Math.max(8, x);
    let finalY = Math.max(8, y);
    
    // UI 오른쪽이 화면 오른쪽을 넘어가는지 확인
    const uiRight = x + containerWidth;
    const viewportRight = scrollX + viewportWidth;
    
    if (uiRight > viewportRight) {
      // 화면을 넘어가면 왼쪽으로 조정
      finalX = viewportRight - containerWidth - 8;
      finalX = Math.max(8, finalX);
    }
    
    // UI 하단이 화면 하단을 넘어가는지 확인
    const uiBottom = y + containerHeight;
    const viewportBottom = scrollY + viewportHeight;
    
    if (uiBottom > viewportBottom) {
      // 화면을 넘어가면 선택 영역 위쪽에 표시
      finalY = y - containerHeight - 16; // 16px 여백
      finalY = Math.max(8, finalY);
    }
    
    container.style.left = `${finalX}px`;
    container.style.top = `${finalY}px`;
  }

  function hide() {
    container.style.display = "none";
    status.style.display = "none";
    warning.style.display = "none";
    hideCalendar();
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
    dateField.input.value = formatDate(date);
  }

  return {
    container,
    inputs: {
      date: dateField.input,
      title: titleField.input,
      startTime: startTimeField.input,
      endTime: endTimeField.input,
      duration: durationField.input,
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
