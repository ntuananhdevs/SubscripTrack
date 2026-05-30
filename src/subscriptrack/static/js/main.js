/**
 * SubsTrack — Main JavaScript
 * Shared scripts for layout, modals, theme, dropdowns, custom selects, toasts, confirm modal.
 */

// ── Toast auto-dismiss ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var toasts = document.querySelectorAll('#toast-container .toast');
  toasts.forEach(function (t) {
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(100%)';
      setTimeout(function () { t.remove(); }, 300);
    }, 4000);
  });
});

// ── Dark Mode ─────────────────────────────────────────────────
(function () {
  // Apply saved theme immediately to prevent flash
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />';
  } else {
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />';
  }
}

document.addEventListener('DOMContentLoaded', updateThemeIcon);

// ── User Dropdown Toggle ──────────────────────────────────────
function toggleUserMenu(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('userDropdown');
  const isOpen = !dropdown.classList.contains('hidden');
  dropdown.classList.toggle('hidden');
  if (!isOpen) {
    setTimeout(function () {
      document.addEventListener('click', closeUserMenuOutside);
    }, 0);
  } else {
    document.removeEventListener('click', closeUserMenuOutside);
  }
}

function closeUserMenuOutside(e) {
  const dropdown = document.getElementById('userDropdown');
  const btn = document.getElementById('userMenuButton');
  if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
    dropdown.classList.add('hidden');
    document.removeEventListener('click', closeUserMenuOutside);
  }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      dropdown.classList.add('hidden');
      document.removeEventListener('click', closeUserMenuOutside);
    }
  }
});

// ── Shared Modal / Flatpickr ──────────────────────────────────
function toggleModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('hidden');
  el.classList.toggle('flex');
}

document.addEventListener('DOMContentLoaded', function () {
  const dateInput = document.getElementById('start_date');
  if (dateInput && typeof flatpickr !== 'undefined') {
    flatpickr(dateInput, {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd/m/Y',
      altInputClass: 'shadcn-input cursor-pointer',
      disableMobile: true,
    });
  }
});

// ── Custom Select Component ───────────────────────────────────
class CustomSelect {
  constructor(el) {
    this.el = el;
    this.trigger = el.querySelector('.custom-select-trigger');
    this.dropdown = el.querySelector('.custom-select-dropdown');
    this.items = el.querySelectorAll('.custom-select-item');
    this.valueEl = el.querySelector('.custom-select-value');
    this.hiddenInput = el.querySelector('input[type="hidden"]');
    this.name = el.dataset.name;

    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.items.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.select(item);
      });
    });

    document.addEventListener('click', (e) => {
      if (!this.el.contains(e.target)) this.close();
    });

    this.trigger.addEventListener('keydown', (e) => this._handleTriggerKey(e));
    this.dropdown.addEventListener('keydown', (e) => this._handleDropdownKey(e));
  }

  toggle() {
    const isOpen = !this.dropdown.classList.contains('hidden');
    if (isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.dropdown.classList.remove('hidden');
    this.trigger.setAttribute('aria-expanded', 'true');
    const selected = this.dropdown.querySelector('.selected');
    if (selected) {
      selected.focus();
    } else {
      this.items[0]?.focus();
    }
  }

  close() {
    this.dropdown.classList.add('hidden');
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  select(item) {
    this.items.forEach((i) => {
      i.classList.remove('selected');
      i.removeAttribute('aria-selected');
    });
    item.classList.add('selected');
    item.setAttribute('aria-selected', 'true');
    this.valueEl.textContent = item.textContent;
    if (this.hiddenInput) {
      this.hiddenInput.value = item.dataset.value;
    }
    this.close();
    this.trigger.focus();
  }

  _handleTriggerKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggle();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.open();
    }
    if (e.key === 'Escape') {
      this.close();
    }
  }

  _handleDropdownKey(e) {
    const items = Array.from(this.items);
    const currentIndex = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[Math.min(currentIndex + 1, items.length - 1)];
      next?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[Math.max(currentIndex - 1, 0)];
      prev?.focus();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (document.activeElement?.classList.contains('custom-select-item')) {
        this.select(document.activeElement);
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
    if (e.key === 'Tab') {
      this.close();
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.custom-select').forEach((el) => new CustomSelect(el));
});

// ── Toast Notification ────────────────────────────────────────
function showToast(message, type) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className =
    'toast pointer-events-auto flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg transform translate-x-0 opacity-100 transition-all duration-300 ' +
    (type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/25 dark:text-red-400'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-400');

  const icon =
    type === 'error'
      ? '<svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>'
      : '<svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';

  toast.innerHTML =
    icon +
    '<span class="flex-1 font-medium">' +
    message +
    '</span>' +
    '<button onclick="this.closest(\'.toast\').remove()" class="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity">' +
    '<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>' +
    '</button>';

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Confirm Modal ─────────────────────────────────────────────
let confirmModalResolve = null;

function confirmModal({ title, message, confirmText, cancelText, type = 'danger' }) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    if (!modal) {
      resolve(false);
      return;
    }

    confirmModalResolve = resolve;

    document.getElementById('confirmModalTitle').textContent = title || 'Xác nhận';
    document.getElementById('confirmModalMessage').textContent = message || 'Bạn có chắc chắn muốn thực hiện hành động này?';

    const confirmBtn = document.getElementById('confirmModalConfirmBtn');
    const cancelBtn = document.getElementById('confirmModalCancelBtn');

    confirmBtn.textContent = confirmText || 'Xác nhận';
    cancelBtn.textContent = cancelText || 'Hủy';

    const iconContainer = document.getElementById('confirmModalIconContainer');
    const icon = document.getElementById('confirmModalIcon');

    iconContainer.className = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full ';
    icon.className = 'h-5 w-5 ';
    confirmBtn.className = 'inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ';

    if (type === 'danger') {
      iconContainer.classList.add('bg-red-50', 'text-red-600', 'dark:bg-red-950/30', 'dark:text-red-400');
      icon.innerHTML = '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>';
      confirmBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'focus:ring-red-500', 'dark:bg-red-600', 'dark:hover:bg-red-700');
    } else if (type === 'warning') {
      iconContainer.classList.add('bg-amber-50', 'text-amber-600', 'dark:bg-amber-950/30', 'dark:text-amber-400');
      icon.innerHTML = '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
      confirmBtn.classList.add('bg-amber-500', 'hover:bg-amber-600', 'focus:ring-amber-500', 'dark:bg-amber-500', 'dark:hover:bg-amber-600');
    } else {
      iconContainer.classList.add('bg-indigo-50', 'text-indigo-600', 'dark:bg-indigo-950/30', 'dark:text-indigo-400');
      icon.innerHTML = '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
      confirmBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700', 'focus:ring-indigo-500', 'dark:bg-indigo-600', 'dark:hover:bg-indigo-700');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    setTimeout(() => {
      const card = modal.querySelector('div');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }, 10);
  });
}

function closeConfirmModal(result) {
  const modal = document.getElementById('confirmModal');
  if (!modal) return;

  const card = modal.querySelector('div');
  card.classList.remove('scale-100');
  card.classList.add('scale-95');

  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (confirmModalResolve) {
      confirmModalResolve(result);
      confirmModalResolve = null;
    }
  }, 150);
}

document.addEventListener('DOMContentLoaded', function () {
  const confirmBtn = document.getElementById('confirmModalConfirmBtn');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const modal = document.getElementById('confirmModal');

  if (confirmBtn) confirmBtn.addEventListener('click', () => closeConfirmModal(true));
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeConfirmModal(false));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeConfirmModal(false);
    });
  }
});