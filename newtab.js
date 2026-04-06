document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    if (savedTheme !== "system") body.setAttribute("data-theme", savedTheme);
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    body.setAttribute("data-theme", "dark");
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    const themeSegments = document.getElementById("theme-segments");
    if (themeSegments) {
      themeSegments.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.value === newTheme);
      });
    }
  });

  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const engineSelector = document.getElementById("engine-selector");
  const engineMenu = document.getElementById("engine-menu");
  const engineIcon = document.getElementById("engine-icon");

  engineSelector.addEventListener("click", (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle("show");
  });
  document.addEventListener("click", () => engineMenu.classList.remove("show"));

  function updateEngineSettings(option) {
    if (!option) return;
    searchForm.action = option.getAttribute("data-action");
    searchInput.name = option.getAttribute("data-param");
    engineIcon.src = option.getAttribute("data-icon");
  }

  const savedEngine = localStorage.getItem("searchEngine") || "google";
  let activeOption = document.querySelector(
    `.engine-option[data-value="${savedEngine}"]`,
  );
  if (activeOption) updateEngineSettings(activeOption);

  document.querySelectorAll(".engine-option").forEach((option) => {
    option.addEventListener("click", () => {
      const val = option.getAttribute("data-value");
      localStorage.setItem("searchEngine", val);
      updateEngineSettings(option);
      searchInput.focus();

      const engineSegments = document.getElementById("engine-segments");
      if (engineSegments) {
        engineSegments.querySelectorAll("button").forEach((btn) => {
          btn.classList.toggle("active", btn.dataset.value === val);
        });
      }
    });
  });

  searchForm.addEventListener("submit", (e) => {
    const query = searchInput.value.trim();
    const isUrl = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/.*)?$/i.test(query);

    if (isUrl && !query.includes(" ")) {
      e.preventDefault();
      let targetUrl = query;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }
      window.location.href = targetUrl;
    }
  });

  const micBtn = document.getElementById("mic-btn");
  if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      micBtn.classList.add("listening");
      searchInput.placeholder = "Listening...";
      searchInput.value = "";
    };
    recognition.onresult = (e) => {
      searchInput.value = e.results[0][0].transcript;
      searchForm.submit();
    };
    recognition.onerror = () => {
      micBtn.classList.remove("listening");
      searchInput.placeholder = "Search";
    };
    recognition.onend = () => {
      micBtn.classList.remove("listening");
      searchInput.placeholder = "Search";
    };
    micBtn.addEventListener("click", () =>
      micBtn.classList.contains("listening")
        ? recognition.stop()
        : recognition.start(),
    );
  } else {
    micBtn.style.display = "none";
  }

  const qrModal = document.getElementById("qr-modal");
  const qrInput = document.getElementById("qr-input");
  const qrOpenBtn = document.getElementById("qr-open-btn");
  const qrCloseBtn = document.getElementById("qr-close-btn");
  const qrContainer = document.getElementById("qrcode");
  const qrPlaceholder = document.getElementById("qr-placeholder");

  qrOpenBtn.addEventListener("click", () => {
    qrModal.classList.add("show");
    qrInput.value = "";
    qrContainer.classList.remove("active");
    qrContainer.innerHTML = "";
    qrPlaceholder.style.setProperty("display", "flex", "important");
    qrInput.focus();
  });

  qrInput.addEventListener("input", () => {
    const text = qrInput.value.trim();
    if (text) {
      qrPlaceholder.style.setProperty("display", "none", "important");
      qrContainer.classList.add("active");
      qrContainer.innerHTML = "";
      if (typeof QRCode !== "undefined") {
        new QRCode(qrContainer, {
          text: text,
          width: 150,
          height: 150,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
      }
    } else {
      qrContainer.classList.remove("active");
      qrContainer.innerHTML = "";
      qrPlaceholder.style.setProperty("display", "flex", "important");
    }
  });

  qrCloseBtn.addEventListener("click", () => qrModal.classList.remove("show"));
  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) qrModal.classList.remove("show");
  });

  const linksContainer = document.getElementById("quick-links-container");
  const defaultLinks = [
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Reddit", url: "https://www.reddit.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "ChatGPT", url: "https://chatgpt.com" },
    { name: "X", url: "https://x.com" },
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "Netflix", url: "https://www.netflix.com" },
  ];

  let quickLinks;
  try {
    quickLinks = JSON.parse(localStorage.getItem("myQuickLinks")) || [
      ...defaultLinks,
    ];
  } catch (e) {
    quickLinks = [...defaultLinks];
  }

  let draggedItemIndex = null;
  const deleteIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
  const editIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;

  function applyActionButtonsVisibility() {
    const hideEdit = localStorage.getItem("hideEditBtn") === "true";
    const hideDelete = localStorage.getItem("hideDeleteBtn") === "true";

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.style.display = hideEdit ? "none" : "";
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.style.display = hideDelete ? "none" : "flex";
    });
  }

  function renderLinks() {
    linksContainer.innerHTML = "";

    quickLinks.forEach((link, index) => {
      const urlObj = new URL(
        link.url.startsWith("http") ? link.url : "https://" + link.url,
      );
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;

      const linkEl = document.createElement("div");
      linkEl.className = "quick-link-wrapper";
      linkEl.setAttribute("draggable", "true");

      linkEl.innerHTML = `
        <button class="edit-btn" data-index="${index}">${editIconSVG}</button>
        <button class="delete-btn" data-index="${index}">${deleteIconSVG}</button>
        <div class="quick-link">
          <div class="link-icon"><img src="${faviconUrl}" alt="${link.name}"></div>
          <span>${link.name}</span>
        </div>
      `;

      linkEl.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(e.currentTarget.getAttribute("data-index"));
        const item = quickLinks[idx];
        nameInput.value = item.name;
        urlInput.value = item.url;
        modal.querySelector("h3").innerText = "Edit Quick Link";
        document.getElementById("save-link-btn").innerText = "Update";
        modal.setAttribute("data-edit-index", idx);
        modal.classList.add("show");
        nameInput.focus();
      });

      linkEl.addEventListener("click", (e) => {
        if (
          !e.target.closest(".delete-btn") &&
          !e.target.closest(".edit-btn")
        ) {
          window.location.href = link.url;
        }
      });

      linkEl.addEventListener("dragstart", () => {
        draggedItemIndex = index;
        setTimeout(() => linkEl.classList.add("dragging"), 0);
      });
      linkEl.addEventListener("dragend", () => {
        linkEl.classList.remove("dragging");
        draggedItemIndex = null;
        document
          .querySelectorAll(".quick-link-wrapper")
          .forEach((el) => el.classList.remove("drag-over"));
      });
      linkEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (draggedItemIndex !== null && draggedItemIndex !== index) {
          linkEl.classList.add("drag-over");
        }
      });
      linkEl.addEventListener("dragleave", () =>
        linkEl.classList.remove("drag-over"),
      );
      linkEl.addEventListener("drop", (e) => {
        e.preventDefault();
        linkEl.classList.remove("drag-over");
        if (draggedItemIndex !== null && draggedItemIndex !== index) {
          const draggedItem = quickLinks.splice(draggedItemIndex, 1)[0];
          quickLinks.splice(index, 0, draggedItem);
          saveAndRender();
        }
      });

      linksContainer.appendChild(linkEl);
    });

    if (quickLinks.length < 7) {
      const addBtnEl = document.createElement("div");
      addBtnEl.className = "quick-link-wrapper add-btn";
      addBtnEl.innerHTML = `
        <div class="quick-link">
          <div class="link-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <span>Add Shortcut</span>
        </div>
      `;
      addBtnEl.addEventListener("click", openModal);
      linksContainer.appendChild(addBtnEl);
    }

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(e.currentTarget.getAttribute("data-index"));
        const deletedLink = quickLinks.splice(idx, 1)[0];
        saveAndRender();
        showUndoToast(deletedLink, idx);
      });
    });

    applyActionButtonsVisibility();
  }

  function saveAndRender() {
    localStorage.setItem("myQuickLinks", JSON.stringify(quickLinks));
    renderLinks();
  }

  const toast = document.getElementById("undo-toast");
  const undoBtn = document.getElementById("undo-btn");
  let toastTimeout;
  let lastDeletedLink = null;
  let lastDeletedIndex = -1;

  function showUndoToast(link, index) {
    lastDeletedLink = link;
    lastDeletedIndex = index;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
      lastDeletedLink = null;
    }, 6000);
  }

  undoBtn.addEventListener("click", () => {
    if (lastDeletedLink) {
      quickLinks.splice(lastDeletedIndex, 0, lastDeletedLink);
      saveAndRender();
      toast.classList.remove("show");
      lastDeletedLink = null;
    }
  });

  const modal = document.getElementById("add-link-modal");
  const nameInput = document.getElementById("new-link-name");
  const urlInput = document.getElementById("new-link-url");

  function openModal() {
    nameInput.value = "";
    urlInput.value = "";
    modal.querySelector("h3").innerText = "Add Quick Link";
    document.getElementById("save-link-btn").innerText = "Add";
    modal.removeAttribute("data-edit-index");
    modal.classList.add("show");
    nameInput.focus();
  }

  function closeModal() {
    modal.classList.remove("show");
  }

  document
    .getElementById("cancel-link-btn")
    .addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById("save-link-btn").addEventListener("click", () => {
    let newName = nameInput.value.trim();
    let newUrl = urlInput.value.trim();

    if (newName && newUrl) {
      const isValidUrl = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/.*)?$/i.test(
        newUrl,
      );
      if (!isValidUrl) {
        alert("Please enter a valid website (e.g., google.com)");
        urlInput.focus();
        return;
      }
      if (!/^https?:\/\//i.test(newUrl)) {
        newUrl = "https://" + newUrl;
      }

      const editIndex = modal.getAttribute("data-edit-index");
      if (editIndex !== null) {
        quickLinks[parseInt(editIndex)] = { name: newName, url: newUrl };
        modal.removeAttribute("data-edit-index");
      } else {
        quickLinks.push({ name: newName, url: newUrl });
      }
      saveAndRender();
      closeModal();
    }
  });

  urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("save-link-btn").click();
  });

  renderLinks();

  document.addEventListener("keydown", (e) => {
    if (document.activeElement.tagName === "INPUT") return;
    if (e.key === "/") {
      e.preventDefault();
      searchInput.focus();
    }
    const keyNum = parseInt(e.key);
    if (keyNum >= 1 && keyNum <= 7) {
      const linkIndex = keyNum - 1;
      if (quickLinks[linkIndex]) {
        window.location.href = quickLinks[linkIndex].url;
      }
    }
  });

  const settingsModal = document.getElementById("settings-modal");
  const settingsBtn = document.getElementById("settings-btn");
  const tabs = document.querySelectorAll(".tab-btn");
  const panes = document.querySelectorAll(".settings-pane");

  function resetSettingsUI() {
    tabs.forEach((t) => t.classList.remove("active"));
    panes.forEach((p) => p.classList.remove("active"));
    if (tabs[0]) tabs[0].classList.add("active");
    if (panes[0]) panes[0].classList.add("active");
  }

  function closeSettings() {
    settingsModal.classList.remove("show");
    settingsModal.setAttribute("aria-hidden", "true");
    setTimeout(resetSettingsUI, 300);
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      settingsModal.classList.add("show");
      settingsModal.setAttribute("aria-hidden", "false");
    });
  }

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panes.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const target = document.getElementById(tab.getAttribute("data-target"));
      if (target) target.classList.add("active");
    });
  });

  function initSegments(containerId, storageKey, defaultValue, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll("button");
    const savedValue = localStorage.getItem(storageKey) || defaultValue;

    buttons.forEach((btn) => {
      if (btn.dataset.value === savedValue) btn.classList.add("active");
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        localStorage.setItem(storageKey, btn.dataset.value);
        callback(btn.dataset.value);
      });
    });
  }

  initSegments("theme-segments", "theme", "system", (val) => {
    if (val === "system") {
      localStorage.removeItem("theme");
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      body.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      body.setAttribute("data-theme", val);
    }
  });

  initSegments("engine-segments", "searchEngine", "google", (val) => {
    const opt = document.querySelector(`.engine-option[data-value="${val}"]`);
    if (opt) updateEngineSettings(opt);
  });

  initSegments("target-segments", "searchTarget", "_self", (val) => {
    searchForm.target = val;
  });

  function handleToggle(id, element, storageKey) {
    const cb = document.getElementById(id);
    if (!cb || !element) return;
    const isHidden = localStorage.getItem(storageKey) === "true";
    cb.checked = !isHidden;
    element.style.display = isHidden ? "none" : "flex";
    cb.addEventListener("change", (e) => {
      const hide = !e.target.checked;
      localStorage.setItem(storageKey, hide);
      element.style.display = hide ? "none" : "flex";
    });
  }

  handleToggle("setting-show-theme-btn", themeToggle, "hideThemeBtn");
  handleToggle("setting-show-qr-btn", qrOpenBtn, "hideQrBtn");

  const showLinksToggle = document.getElementById("setting-show-links");
  const isLinksHidden = localStorage.getItem("hideQuickLinks") === "true";
  if (showLinksToggle) {
    showLinksToggle.checked = !isLinksHidden;
    linksContainer.style.display = isLinksHidden ? "none" : "flex";
    showLinksToggle.addEventListener("change", (e) => {
      const hide = !e.target.checked;
      localStorage.setItem("hideQuickLinks", hide);
      linksContainer.style.display = hide ? "none" : "flex";
    });
  }

  function setupActionToggle(toggleId, storageKey) {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;

    const isHidden = localStorage.getItem(storageKey) === "true";
    toggle.checked = !isHidden;

    toggle.addEventListener("change", (e) => {
      const hide = !e.target.checked;
      localStorage.setItem(storageKey, hide);
      applyActionButtonsVisibility();
    });
  }

  setupActionToggle("setting-show-edit", "hideEditBtn");
  setupActionToggle("setting-show-delete", "hideDeleteBtn");

  const btnRestoreLinks = document.getElementById("btn-restore-links");
  if (btnRestoreLinks) {
    btnRestoreLinks.addEventListener("click", () => {
      if (confirm("Reset Quick Links to default?")) {
        quickLinks = [...defaultLinks];
        saveAndRender();
      }
    });
  }

  const btnExport = document.getElementById("btn-export");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const data = {
        quickLinks:
          JSON.parse(localStorage.getItem("myQuickLinks")) || defaultLinks,
        theme: localStorage.getItem("theme"),
        searchEngine: localStorage.getItem("searchEngine"),
        searchTarget: localStorage.getItem("searchTarget"),
        hideQuickLinks: localStorage.getItem("hideQuickLinks"),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newtab-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const importInput = document.getElementById("import-file");
  const btnImport = document.getElementById("btn-import");
  if (btnImport && importInput) {
    btnImport.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.quickLinks)
            localStorage.setItem(
              "myQuickLinks",
              JSON.stringify(data.quickLinks),
            );
          if (data.theme) localStorage.setItem("theme", data.theme);
          if (data.searchEngine)
            localStorage.setItem("searchEngine", data.searchEngine);
          if (data.searchTarget)
            localStorage.setItem("searchTarget", data.searchTarget);
          if (data.hideQuickLinks)
            localStorage.setItem("hideQuickLinks", data.hideQuickLinks);
          alert("Backup restored! Reloading...");
          location.reload();
        } catch (err) {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    });
  }

  const btnResetAll = document.getElementById("btn-reset-all");
  if (btnResetAll) {
    btnResetAll.addEventListener("click", () => {
      if (confirm("Erase all data and settings?")) {
        localStorage.clear();
        location.reload();
      }
    });
  }
});
