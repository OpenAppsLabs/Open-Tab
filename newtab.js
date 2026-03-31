document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
  } else if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    body.setAttribute('data-theme', 'dark');
  }
  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const engineSelector = document.getElementById('engine-selector');
  const engineMenu = document.getElementById('engine-menu');
  const engineIcon = document.getElementById('engine-icon');

  engineSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('show');
  });
  document.addEventListener('click', () => engineMenu.classList.remove('show'));

  const savedEngine = localStorage.getItem('searchEngine') || 'google';
  let activeOption = document.querySelector(
    `.engine-option[data-value="${savedEngine}"]`,
  );
  if (activeOption) updateEngineSettings(activeOption);

  document.querySelectorAll('.engine-option').forEach((option) => {
    option.addEventListener('click', () => {
      localStorage.setItem('searchEngine', option.getAttribute('data-value'));
      updateEngineSettings(option);
      searchInput.focus();
    });
  });

  function updateEngineSettings(option) {
    searchForm.action = option.getAttribute('data-action');
    searchInput.name = option.getAttribute('data-param');
    engineIcon.src = option.getAttribute('data-icon');
  }

  searchForm.addEventListener('submit', (e) => {
    const query = searchInput.value.trim();
    const isUrl = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/.*)?$/i.test(query);

    if (isUrl && !query.includes(' ')) {
      e.preventDefault();
      let targetUrl = query;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }
      window.location.href = targetUrl;
    }
  });

  const micBtn = document.getElementById('mic-btn');
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => {
      micBtn.classList.add('listening');
      searchInput.placeholder = 'Listening...';
      searchInput.value = '';
    };
    recognition.onresult = (e) => {
      searchInput.value = e.results[0][0].transcript;
      searchForm.submit();
    };
    recognition.onerror = () => {
      micBtn.classList.remove('listening');
      searchInput.placeholder = 'Search';
    };
    recognition.onend = () => {
      micBtn.classList.remove('listening');
      searchInput.placeholder = 'Search';
    };
    micBtn.addEventListener('click', () =>
      micBtn.classList.contains('listening')
        ? recognition.stop()
        : recognition.start(),
    );
  } else {
    micBtn.style.display = 'none';
  }

  const qrModal = document.getElementById('qr-modal');
  const qrInput = document.getElementById('qr-input');
  const qrOpenBtn = document.getElementById('qr-open-btn');
  const qrCloseBtn = document.getElementById('qr-close-btn');
  const qrContainer = document.getElementById('qrcode');
  const qrPlaceholder = document.getElementById('qr-placeholder');

  qrOpenBtn.addEventListener('click', () => {
    qrModal.classList.add('show');
    qrInput.value = '';
    qrContainer.classList.remove('active');
    qrContainer.innerHTML = '';
    qrPlaceholder.style.display = 'flex';
    qrInput.focus();
  });

  qrInput.addEventListener('input', () => {
    const text = qrInput.value.trim();

    if (text) {
      qrPlaceholder.style.setProperty('display', 'none', 'important');
      qrContainer.classList.add('active');
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: text,
        width: 150,
        height: 150,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    } else {
      qrContainer.classList.remove('active');
      qrContainer.innerHTML = '';
      qrPlaceholder.style.setProperty('display', 'flex', 'important');
    }
  });

  qrCloseBtn.addEventListener('click', () => qrModal.classList.remove('show'));
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) qrModal.classList.remove('show');
  });

  const linksContainer = document.getElementById('quick-links-container');
  const defaultLinks = [
    { name: 'YouTube', url: 'https://www.youtube.com' },
    { name: 'Reddit', url: 'https://www.reddit.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'ChatGPT', url: 'https://chatgpt.com' },
    { name: 'X', url: 'https://x.com' },
    { name: 'Gmail', url: 'https://mail.google.com' },
    { name: 'Netflix', url: 'https://www.netflix.com' },
  ];

  let quickLinks =
    JSON.parse(localStorage.getItem('myQuickLinks')) || defaultLinks;
  let draggedItemIndex = null;

  const deleteIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

  function renderLinks() {
    linksContainer.innerHTML = '';

    quickLinks.forEach((link, index) => {
      const urlObj = new URL(
        link.url.startsWith('http') ? link.url : 'https://' + link.url,
      );
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;

      const linkEl = document.createElement('div');
      linkEl.className = 'quick-link-wrapper';
      linkEl.setAttribute('draggable', 'true');

      linkEl.innerHTML = `
        <button class="delete-btn" data-index="${index}">${deleteIconSVG}</button>
        <div class="quick-link">
          <div class="link-icon"><img src="${faviconUrl}" alt="${link.name}"></div>
          <span>${link.name}</span>
        </div>
      `;

      linkEl.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-btn')) {
          window.location.href = link.url;
        }
      });

      linkEl.addEventListener('dragstart', (e) => {
        draggedItemIndex = index;
        setTimeout(() => linkEl.classList.add('dragging'), 0);
      });
      linkEl.addEventListener('dragend', () => {
        linkEl.classList.remove('dragging');
        draggedItemIndex = null;
        document
          .querySelectorAll('.quick-link-wrapper')
          .forEach((el) => el.classList.remove('drag-over'));
      });
      linkEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (draggedItemIndex !== null && draggedItemIndex !== index) {
          linkEl.classList.add('drag-over');
        }
      });
      linkEl.addEventListener('dragleave', () =>
        linkEl.classList.remove('drag-over'),
      );
      linkEl.addEventListener('drop', (e) => {
        e.preventDefault();
        linkEl.classList.remove('drag-over');
        if (draggedItemIndex !== null && draggedItemIndex !== index) {
          const draggedItem = quickLinks.splice(draggedItemIndex, 1)[0];
          quickLinks.splice(index, 0, draggedItem);
          saveAndRender();
        }
      });

      linksContainer.appendChild(linkEl);
    });

    if (quickLinks.length < 7) {
      const addBtnEl = document.createElement('div');
      addBtnEl.className = 'quick-link-wrapper add-btn';
      addBtnEl.innerHTML = `
        <div class="quick-link">
          <div class="link-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <span>Add Shortcut</span>
        </div>
      `;
      addBtnEl.addEventListener('click', openModal);
      linksContainer.appendChild(addBtnEl);
    }

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        const deletedLink = quickLinks.splice(index, 1)[0];
        saveAndRender();
        showUndoToast(deletedLink, index);
      });
    });
  }

  function saveAndRender() {
    localStorage.setItem('myQuickLinks', JSON.stringify(quickLinks));
    renderLinks();
  }

  const toast = document.getElementById('undo-toast');
  const undoBtn = document.getElementById('undo-btn');
  let toastTimeout;
  let lastDeletedLink = null;
  let lastDeletedIndex = -1;

  function showUndoToast(link, index) {
    lastDeletedLink = link;
    lastDeletedIndex = index;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      lastDeletedLink = null;
    }, 6000);
  }

  undoBtn.addEventListener('click', () => {
    if (lastDeletedLink) {
      quickLinks.splice(lastDeletedIndex, 0, lastDeletedLink);
      saveAndRender();
      toast.classList.remove('show');
      lastDeletedLink = null;
    }
  });

  const modal = document.getElementById('add-link-modal');
  const nameInput = document.getElementById('new-link-name');
  const urlInput = document.getElementById('new-link-url');

  function openModal() {
    nameInput.value = '';
    urlInput.value = '';
    modal.classList.add('show');
    nameInput.focus();
  }
  function closeModal() {
    modal.classList.remove('show');
  }

  document
    .getElementById('cancel-link-btn')
    .addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById('save-link-btn').addEventListener('click', () => {
    let newName = nameInput.value.trim();
    let newUrl = urlInput.value.trim();

    if (newName && newUrl) {
      const isValidUrl = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/.*)?$/i.test(
        newUrl,
      );

      if (!isValidUrl) {
        alert('Please enter a valid website (e.g., google.com)');
        urlInput.focus();
        return;
      }

      if (!/^https?:\/\//i.test(newUrl)) {
        newUrl = 'https://' + newUrl;
      }

      quickLinks.push({ name: newName, url: newUrl });
      saveAndRender();
      closeModal();
    }
  });

  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('save-link-btn').click();
  });

  renderLinks();

  document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.key === '/') {
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
});
