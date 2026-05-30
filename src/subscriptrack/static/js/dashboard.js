/**
 * SubsTrack — Dashboard JavaScript
 * Dashboard-specific scripts: form submission, modals, service picker, flatpickr init, etc.
 */

// ── Helpers ───────────────────────────────────────────────────

let addFlatpickr = null;
let addEndFlatpickr = null;
let editFlatpickr = null;
let editEndFlatpickr = null;

/** Submit a form via fetch (AJAX) and call the appropriate handler. */
function submitFormAjax(form, { onSuccess, onError }) {
  const formData = new FormData(form);
  fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
    .then((res) =>
      res.json().then((data) => ({ ok: res.ok, status: res.status, data }))
    )
    .then(({ ok, data }) => {
      if (ok && data.success) {
        if (onSuccess) onSuccess(data);
      } else {
        if (onError) onError(data);
      }
    })
    .catch(() => {
      showToast('Lỗi kết nối, vui lòng thử lại.', 'error');
    });
}

/** Show field-level errors inside a modal. */
function showFormErrors(modalId, errors) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.querySelectorAll('.field-error').forEach((el) => el.remove());
  modal.querySelectorAll('.shadcn-input-error').forEach((el) => {
    el.classList.remove('shadcn-input-error');
  });

  for (const [field, message] of Object.entries(errors)) {
    const input = modal.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add('shadcn-input-error');
      const errorEl = document.createElement('p');
      errorEl.className = 'mt-1 text-xs text-red-500 field-error';
      errorEl.textContent = message;
      input.parentNode.appendChild(errorEl);
    }
  }
}

/** Reset a custom-select to a given value. */
function resetCustomSelect(selector, value) {
  const container = document.querySelector(selector);
  if (!container) return;
  const items = container.querySelectorAll('.custom-select-item');
  const valueEl = container.querySelector('.custom-select-value');
  const hiddenInput = container.querySelector('input[type="hidden"]');
  items.forEach(function (item) {
    const isMatch = item.dataset.value === value;
    item.classList.toggle('selected', isMatch);
    item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    if (isMatch) {
      if (valueEl) valueEl.textContent = item.textContent;
      if (hiddenInput) hiddenInput.value = value;
    }
  });
}

/** Re-fetch dashboard HTML and swap the content area. */
function refreshDashboard() {
  const cacheBusterUrl = window.location.pathname + '?_=' + Date.now();
  fetch(cacheBusterUrl, {
    cache: 'no-store',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
    .then((res) => res.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContainer = doc.getElementById('dashboard-content');
      const currentContainer = document.getElementById('dashboard-content');
      if (newContainer && currentContainer) {
        currentContainer.innerHTML = newContainer.innerHTML;
      }
    });
}

/** Initialise flatpickr for the add-modal date fields. */
function initAddFlatpickr() {
  const startInput = document.getElementById('start_date');
  const endInput = document.getElementById('end_date');

  if (addFlatpickr) {
    try { addFlatpickr.destroy(); } catch (_) {}
    addFlatpickr = null;
  }
  if (addEndFlatpickr) {
    try { addEndFlatpickr.destroy(); } catch (_) {}
    addEndFlatpickr = null;
  }

  if (startInput && typeof flatpickr !== 'undefined') {
    addFlatpickr = flatpickr(startInput, {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd/m/Y',
      altInputClass: 'shadcn-input cursor-pointer',
      disableMobile: true,
    });
  }
  if (endInput && typeof flatpickr !== 'undefined') {
    addEndFlatpickr = flatpickr(endInput, {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd/m/Y',
      altInputClass: 'shadcn-input cursor-pointer',
      disableMobile: true,
    });
  }
}

/** Initialise custom-select components on the page. */
function initCustomSelects() {
  document.querySelectorAll('.custom-select').forEach((el) => {
    new CustomSelect(el);
  });
}

// ── openEditModal ─────────────────────────────────────────────

function openEditModal(data) {
  const form = document.getElementById('editForm');
  form.action = document.getElementById('editForm').getAttribute('data-base-action') ||
    window.location.pathname.replace('/dashboard', '/subscriptions/edit/') + data.id;

  document.getElementById('edit_name').value = data.name;
  document.getElementById('edit_amount').value = data.amount;
  document.getElementById('edit_card_name').value = data.card_name;

  // Set currency custom select
  const currencySelect = document.querySelector(
    '#editModal .custom-select[data-name="currency"]'
  );
  if (currencySelect) {
    const items = currencySelect.querySelectorAll('.custom-select-item');
    const hiddenInput = currencySelect.querySelector('input[type="hidden"]');
    const valueEl = currencySelect.querySelector('.custom-select-value');
    items.forEach(function (item) {
      const isMatch = item.dataset.value === data.currency;
      item.classList.toggle('selected', isMatch);
      item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      if (isMatch) {
        valueEl.textContent = item.textContent;
        if (hiddenInput) hiddenInput.value = data.currency;
      }
    });
  }

  // Set cycle custom select
  const cycleSelect = document.querySelector(
    '#editModal .custom-select[data-name="cycle"]'
  );
  if (cycleSelect) {
    const items = cycleSelect.querySelectorAll('.custom-select-item');
    const hiddenInput = cycleSelect.querySelector('input[type="hidden"]');
    const valueEl = cycleSelect.querySelector('.custom-select-value');
    items.forEach(function (item) {
      const isMatch = item.dataset.value === data.cycle;
      item.classList.toggle('selected', isMatch);
      item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      if (isMatch) {
        valueEl.textContent = item.textContent;
        if (hiddenInput) hiddenInput.value = data.cycle;
      }
    });
  }

  // Set category custom select
  const categorySelect = document.querySelector(
    '#editModal .custom-select[data-name="category"]'
  );
  if (categorySelect) {
    const items = categorySelect.querySelectorAll('.custom-select-item');
    const hiddenInput = categorySelect.querySelector('input[type="hidden"]');
    const valueEl = categorySelect.querySelector('.custom-select-value');
    const catValue = data.category || '';
    items.forEach(function (item) {
      const isMatch = item.dataset.value === catValue;
      item.classList.toggle('selected', isMatch);
      item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      if (isMatch) {
        valueEl.textContent = item.textContent;
        if (hiddenInput) hiddenInput.value = catValue;
      }
    });
  }

  // Set start date with flatpickr
  const dateInput = document.getElementById('edit_start_date');
  if (dateInput) {
    if (!editFlatpickr && typeof flatpickr !== 'undefined') {
      editFlatpickr = flatpickr(dateInput, {
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y',
        altInputClass: 'shadcn-input cursor-pointer',
        disableMobile: true,
      });
    }
    if (editFlatpickr) {
      editFlatpickr.setDate(data.start_date);
    }
  }

  // Set end date with flatpickr
  const endDateInput = document.getElementById('edit_end_date');
  if (endDateInput) {
    if (!editEndFlatpickr && typeof flatpickr !== 'undefined') {
      editEndFlatpickr = flatpickr(endDateInput, {
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y',
        altInputClass: 'shadcn-input cursor-pointer',
        disableMobile: true,
      });
    }
    if (editEndFlatpickr) {
      editEndFlatpickr.setDate(data.end_date || '');
    }
  }

  // Clear any previous errors shown inside edit modal
  document
    .querySelectorAll('#editModal .field-error')
    .forEach((el) => el.remove());
  document
    .querySelectorAll('#editModal .shadcn-input-error')
    .forEach((el) => el.classList.remove('shadcn-input-error'));

  toggleModal('editModal');
}

// ── VND amount validation ─────────────────────────────────────

/** Validate that amount > 1000 when currency is VND. Returns true if valid. */
function validateVndAmount(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return true;

  const amountInput =
    modalId === 'addModal'
      ? document.getElementById('amount')
      : document.getElementById('edit_amount');
  const currencyHidden = modal.querySelector(
    '.custom-select[data-name="currency"] input[type="hidden"]'
  );

  if (!amountInput || !currencyHidden) return true;

  const prevError = modal.querySelector(
    '.field-error[data-field="amount-vnd"]'
  );
  if (prevError) prevError.remove();

  const currency = currencyHidden.value;
  const amount = parseFloat(amountInput.value);

  if (currency === 'VND' && !isNaN(amount) && amount <= 1000) {
    amountInput.classList.add('shadcn-input-error');
    const errorEl = document.createElement('p');
    errorEl.className = 'mt-1 text-xs text-red-500 field-error';
    errorEl.dataset.field = 'amount-vnd';
    errorEl.textContent = 'Số tiền VND phải lớn hơn 1.000.';
    amountInput.parentNode.appendChild(errorEl);
    return false;
  }

  return true;
}

// ── Form submission handling (event delegation) ──────────────

document.addEventListener('submit', function (e) {
  const form = e.target;

  // Add form
  if (form.closest('#addModal')) {
    e.preventDefault();
    if (!validateVndAmount('addModal')) return;
    submitFormAjax(form, {
      onSuccess: function (data) {
        toggleModal('addModal');
        form.reset();
        document
          .querySelectorAll('#addModal .field-error')
          .forEach((el) => el.remove());
        document
          .querySelectorAll('#addModal .shadcn-input-error')
          .forEach((el) => el.classList.remove('shadcn-input-error'));
        resetCustomSelect(
          '#addModal .custom-select[data-name="currency"]',
          'VND'
        );
        resetCustomSelect(
          '#addModal .custom-select[data-name="cycle"]',
          'monthly'
        );
        resetCustomSelect(
          '#addModal .custom-select[data-name="category"]',
          ''
        );
        showToast(data.message || 'Thêm dịch vụ thành công.', 'success');
        refreshDashboard();
      },
      onError: function (data) {
        if (data.errors) {
          showFormErrors('addModal', data.errors);
          if (data.errors.general) {
            showToast(data.errors.general, 'error');
          }
        } else {
          showToast(data.error || 'Có lỗi xảy ra khi thêm dịch vụ.', 'error');
        }
      },
    });
  }

  // Edit form
  if (form.closest('#editModal')) {
    e.preventDefault();
    if (!validateVndAmount('editModal')) return;
    submitFormAjax(form, {
      onSuccess: function (data) {
        toggleModal('editModal');
        showToast(data.message || 'Cập nhật dịch vụ thành công.', 'success');
        refreshDashboard();
      },
      onError: function (data) {
        if (data.errors) {
          showFormErrors('editModal', data.errors);
          if (data.errors.general) {
            showToast(data.errors.general, 'error');
          }
        } else {
          showToast(data.error || 'Có lỗi xảy ra khi cập nhật dịch vụ.', 'error');
        }
      },
    });
  }

  // Delete form
  if (form.classList.contains('delete-form')) {
    e.preventDefault();
    confirmModal({
      title: 'Xác nhận xóa dịch vụ',
      message: 'Bạn có chắc chắn muốn xóa dịch vụ này không? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa dịch vụ',
      cancelText: 'Hủy',
      type: 'danger'
    }).then((confirmed) => {
      if (confirmed) {
        submitFormAjax(form, {
          onSuccess: function (data) {
            showToast(data.message || 'Xóa dịch vụ thành công.', 'success');
            refreshDashboard();
          },
          onError: function (data) {
            showToast(
              data.error || data.errors?.general || 'Có lỗi xảy ra.',
              'error'
            );
          },
        });
      }
    });
  }
});

// ── Real-time VND amount validation ──────────────────────────

/** Remove the VND-amount error dynamically when user fixes the value. */
function clearVndErrorOnInput(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  const amountInput =
    modalId === 'addModal'
      ? document.getElementById('amount')
      : document.getElementById('edit_amount');

  function removeVndError() {
    const err = modal.querySelector('.field-error[data-field="amount-vnd"]');
    if (err) err.remove();
    if (amountInput) amountInput.classList.remove('shadcn-input-error');
  }

  if (amountInput) {
    amountInput.addEventListener('input', removeVndError);
  }
  modal
    .querySelectorAll(
      '.custom-select[data-name="currency"] .custom-select-item'
    )
    .forEach(function (item) {
      item.addEventListener('click', function () {
        setTimeout(removeVndError, 0);
      });
    });
}

// ── Popular Services Picker ──────────────────────────────────

const POPULAR_SERVICES = [
  // Giải trí
  { id:'netflix', name:'Netflix', cat:'Giải trí', cycle:'monthly', prices:{VND:180000,USD:15.49}, icon:'netflix', color:'#E50914' },
  { id:'spotify', name:'Spotify Premium', cat:'Giải trí', cycle:'monthly', prices:{VND:59000,USD:9.99}, icon:'spotify', color:'#1DB954' },
  { id:'youtube-premium', name:'YouTube Premium', cat:'Giải trí', cycle:'monthly', prices:{VND:79000,USD:11.99}, icon:'youtube', color:'#FF0000' },
  { id:'apple-music', name:'Apple Music', cat:'Giải trí', cycle:'monthly', prices:{VND:59000,USD:10.99}, icon:'applemusic', color:'#FA2430' },
  { id:'disney-plus', name:'Disney+', cat:'Giải trí', cycle:'monthly', prices:{VND:99000,USD:7.99}, icon:'disneyplus', color:'#113CCF' },
  { id:'hbogo', name:'HBO Go', cat:'Giải trí', cycle:'monthly', prices:{VND:99000,USD:14.99}, icon:'hbo', color:'#5822B4' },
  { id:'apple-tv', name:'Apple TV+', cat:'Giải trí', cycle:'monthly', prices:{VND:99000,USD:6.99}, icon:'appletv', color:'#000000' },
  { id:'amazon-prime', name:'Amazon Prime Video', cat:'Giải trí', cycle:'monthly', prices:{VND:99000,USD:8.99}, icon:'amazonprime', color:'#FF9900' },
  { id:'zing-mp3', name:'Zing MP3', cat:'Giải trí', cycle:'monthly', prices:{VND:49000,USD:2.99}, icon:'zingmp3', color:'#0066FF' },
  { id:'fpt-play', name:'FPT Play', cat:'Giải trí', cycle:'monthly', prices:{VND:99000,USD:4.99}, icon:'fptplay', color:'#E60000' },
  { id:'vieon', name:'VieON', cat:'Giải trí', cycle:'monthly', prices:{VND:99000,USD:4.99}, icon:'vieon', color:'#FF5A00' },
  { id:'steam', name:'Steam', cat:'Giải trí', cycle:'monthly', prices:{VND:50000,USD:0}, icon:'steam', color:'#000000' },
  { id:'twitch', name:'Twitch', cat:'Giải trí', cycle:'monthly', prices:{VND:119000,USD:4.99}, icon:'twitch', color:'#9146FF' },

  // Lưu trữ & Cloud
  { id:'google-one-100', name:'Google One (100GB)', cat:'Lưu trữ & Cloud', cycle:'monthly', prices:{VND:49000,USD:1.99}, icon:'google', color:'#4285F4' },
  { id:'google-one-2tb', name:'Google One (2TB)', cat:'Lưu trữ & Cloud', cycle:'monthly', prices:{VND:249000,USD:9.99}, icon:'google', color:'#4285F4' },
  { id:'icloud-50', name:'iCloud+ (50GB)', cat:'Lưu trữ & Cloud', cycle:'monthly', prices:{VND:19000,USD:0.99}, icon:'icloud', color:'#3690F3' },
  { id:'icloud-200', name:'iCloud+ (200GB)', cat:'Lưu trữ & Cloud', cycle:'monthly', prices:{VND:59000,USD:2.99}, icon:'icloud', color:'#3690F3' },
  { id:'icloud-2tb', name:'iCloud+ (2TB)', cat:'Lưu trữ & Cloud', cycle:'monthly', prices:{VND:199000,USD:9.99}, icon:'icloud', color:'#3690F3' },
  { id:'dropbox-plus', name:'Dropbox Plus', cat:'Lưu trữ & Cloud', cycle:'monthly', prices:{VND:199000,USD:9.99}, icon:'dropbox', color:'#0061FF' },
  { id:'onedrive-100', name:'OneDrive (100GB)', cat:'Lưu trữ & Cloud', cycle:'monthly', prices:{VND:29000,USD:1.99}, icon:'onedrive', color:'#0078D4' },
  { id:'mega', name:'MEGA', cat:'Lưu trữ & Cloud', cycle:'monthly', prices:{VND:99000,USD:4.99}, icon:'mega', color:'#D9272E' },

  // Công cụ & Phần mềm
  { id:'chatgpt-plus', name:'ChatGPT Plus', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:20}, icon:'openai', color:'#10A37F' },
  { id:'chatgpt-pro', name:'ChatGPT Pro', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:200}, icon:'openai', color:'#10A37F' },
  { id:'github-copilot', name:'GitHub Copilot', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:10}, icon:'github', color:'#181717' },
  { id:'github-copilot-pro', name:'GitHub Copilot Pro', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:19}, icon:'github', color:'#181717' },
  { id:'cursor', name:'Cursor Pro', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:20}, icon:'cursor', color:'#6C47FF' },
  { id:'m365-personal', name:'Microsoft 365 Personal', cat:'Công cụ & Phần mềm', cycle:'yearly', prices:{VND:790000,USD:69.99}, icon:'microsoftoffice', color:'#D83B01' },
  { id:'m365-family', name:'Microsoft 365 Family', cat:'Công cụ & Phần mềm', cycle:'yearly', prices:{VND:990000,USD:99.99}, icon:'microsoftoffice', color:'#D83B01' },
  { id:'adobe-ps', name:'Adobe Photoshop', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:22.99}, icon:'adobephotoshop', color:'#31A8FF' },
  { id:'adobe-ai', name:'Adobe Illustrator', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:22.99}, icon:'adobeillustrator', color:'#FF9A00' },
  { id:'figma-pro', name:'Figma Professional', cat:'Công cụ & Phần mềm', cycle:'yearly', prices:{VND:0,USD:144}, icon:'figma', color:'#F24E1E' },
  { id:'canva-pro', name:'Canva Pro', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:12.99}, icon:'canva', color:'#00C4CC' },
  { id:'notion-plus', name:'Notion Plus', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:10}, icon:'notion', color:'#000000' },
  { id:'linear', name:'Linear', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:12}, icon:'linear', color:'#5E6AD2' },
  { id:'vercel', name:'Vercel Pro', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:20}, icon:'vercel', color:'#000000' },
  { id:'jetbrains', name:'JetBrains All Products', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:24.90}, icon:'jetbrains', color:'#000000' },
  { id:'1password', name:'1Password', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:2.99}, icon:'1password', color:'#0094F5' },
  { id:'notion-ai', name:'Notion AI', cat:'Công cụ & Phần mềm', cycle:'monthly', prices:{VND:0,USD:10}, icon:'notion', color:'#000000' },

  // Mạng xã hội
  { id:'linkedin-premium', name:'LinkedIn Premium', cat:'Mạng xã hội', cycle:'monthly', prices:{VND:0,USD:29.99}, icon:'linkedin', color:'#0A66C2' },
  { id:'x-premium', name:'X Premium', cat:'Mạng xã hội', cycle:'monthly', prices:{VND:0,USD:8}, icon:'x', color:'#000000' },

  // Sức khỏe
  { id:'apple-fitness', name:'Apple Fitness+', cat:'Sức khỏe', cycle:'monthly', prices:{VND:0,USD:9.99}, icon:'applefitness', color:'#FF2D55' },
  { id:'headspace', name:'Headspace', cat:'Sức khỏe', cycle:'monthly', prices:{VND:0,USD:12.99}, icon:'headspace', color:'#F47D31' },
  { id:'calm', name:'Calm', cat:'Sức khỏe', cycle:'yearly', prices:{VND:0,USD:69.99}, icon:'calm', color:'#2B6CB0' },
  { id:'strava', name:'Strava Premium', cat:'Sức khỏe', cycle:'monthly', prices:{VND:0,USD:5}, icon:'strava', color:'#FC4C02' },

  // Giáo dục
  { id:'duolingo-super', name:'Duolingo Super', cat:'Giáo dục', cycle:'monthly', prices:{VND:0,USD:6.99}, icon:'duolingo', color:'#58CC02' },
  { id:'udemy-personal', name:'Udemy Personal Plan', cat:'Giáo dục', cycle:'monthly', prices:{VND:0,USD:19.99}, icon:'udemy', color:'#A435F0' },
  { id:'skillshare', name:'Skillshare', cat:'Giáo dục', cycle:'yearly', prices:{VND:0,USD:168}, icon:'skillshare', color:'#00FF84' },
];

let servicePickerOpen = false;

function toggleServicePicker() {
  servicePickerOpen = !servicePickerOpen;
  const picker = document.getElementById('servicePicker');
  const chevron = document.getElementById('pickerChevron');
  if (servicePickerOpen) {
    picker.classList.remove('hidden');
    chevron.style.transform = 'rotate(180deg)';
    renderServices(POPULAR_SERVICES);
    document.getElementById('serviceSearch').value = '';
    document.getElementById('serviceSearch').focus();
  } else {
    picker.classList.add('hidden');
    chevron.style.transform = '';
  }
}

function renderServices(list) {
  const grid = document.getElementById('serviceGrid');
  const currency = getCurrentCurrency('addModal');
  grid.innerHTML = list.map(s => {
    const price = s.prices[currency] || s.prices['VND'] || 0;
    const priceStr = price > 0
      ? (currency === 'VND' ? price.toLocaleString('vi-VN') + 'đ' : '$' + price.toFixed(2))
      : '';
    return `<button type="button" onclick="selectService('${s.id}')"
              class="flex flex-col items-center gap-1.5 rounded-lg border border-transparent p-2.5 text-center transition-all hover:border-zinc-200 hover:bg-white hover:shadow-sm dark:hover:border-zinc-600 dark:hover:bg-zinc-900">
              <img src="https://cdn.simpleicons.org/${s.icon}/${s.color.replace('#','')}"
                   alt="${s.name}"
                   class="h-7 w-7 rounded"
                   loading="lazy"
                   onerror="this.outerHTML='<span class=\\'flex h-7 w-7 items-center justify-center rounded text-xs font-bold\\' style=\\'background:${s.color};color:#fff\\'>${s.name[0]}</span>'" />
              <span class="text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400 line-clamp-2">${s.name}</span>
              ${priceStr ? `<span class="text-[9px] font-semibold text-indigo-500 dark:text-indigo-400">${priceStr}</span>` : ''}
            </button>`;
  }).join('');
}

function filterServices() {
  const q = document.getElementById('serviceSearch').value.toLowerCase().trim();
  const filtered = q
    ? POPULAR_SERVICES.filter(s => s.name.toLowerCase().includes(q))
    : POPULAR_SERVICES;
  renderServices(filtered);
}

function selectService(id) {
  const service = POPULAR_SERVICES.find(s => s.id === id);
  if (!service) return;

  document.getElementById('name').value = service.name;

  const currency = getCurrentCurrency('addModal');
  const price = service.prices[currency] || service.prices['VND'] || 0;
  document.getElementById('amount').value = price > 0 ? price : '';

  const cycleSelect = document.querySelector('#addModal .custom-select[data-name="cycle"]');
  if (cycleSelect) {
    const items = cycleSelect.querySelectorAll('.custom-select-item');
    const hiddenInput = cycleSelect.querySelector('input[type="hidden"]');
    const valueEl = cycleSelect.querySelector('.custom-select-value');
    items.forEach(function (item) {
      const isMatch = item.dataset.value === service.cycle;
      item.classList.toggle('selected', isMatch);
      item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      if (isMatch) {
        valueEl.textContent = item.textContent;
        if (hiddenInput) hiddenInput.value = service.cycle;
      }
    });
  }

  const catSelect = document.querySelector('#addModal .custom-select[data-name="category"]');
  if (catSelect && service.cat) {
    const items = catSelect.querySelectorAll('.custom-select-item');
    const hiddenInput = catSelect.querySelector('input[type="hidden"]');
    const valueEl = catSelect.querySelector('.custom-select-value');
    items.forEach(function (item) {
      const isMatch = item.dataset.value === service.cat;
      item.classList.toggle('selected', isMatch);
      item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      if (isMatch) {
        valueEl.textContent = item.textContent;
        if (hiddenInput) hiddenInput.value = service.cat;
      }
    });
  }

  toggleServicePicker();
}

function getCurrentCurrency(modalId) {
  const hidden = document.querySelector(`#${modalId} .custom-select[data-name="currency"] input[type="hidden"]`);
  return hidden ? hidden.value : 'VND';
}

// ── Init on page load ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initAddFlatpickr();
  clearVndErrorOnInput('addModal');
  clearVndErrorOnInput('editModal');

  document.querySelectorAll('#addModal .custom-select[data-name="currency"] .custom-select-item').forEach(function (item) {
    item.addEventListener('click', function () {
      if (servicePickerOpen) {
        const q = document.getElementById('serviceSearch').value.toLowerCase().trim();
        const filtered = q ? POPULAR_SERVICES.filter(s => s.name.toLowerCase().includes(q)) : POPULAR_SERVICES;
        renderServices(filtered);
      }
    });
  });
});