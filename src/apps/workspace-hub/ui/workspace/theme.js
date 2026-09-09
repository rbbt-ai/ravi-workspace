(() => {
  'use strict';
  const config=JSON.parse(document.getElementById('workspace-config').textContent);
  const key = `ravi-workspace:${config.installationId}:theme:v1`;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = ['day','dark'].includes(config.defaultTheme)?config.defaultTheme:null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'day' || saved === 'dark') preference = saved;
  } catch { /* A blocked preference store must not block the interface. */ }
  const apply = theme => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#040506' : '#f5f6fa');
    window.dispatchEvent(new Event('workspace-theme-change'));
  };
  const set = theme => {
    if (theme !== 'day' && theme !== 'dark') return;
    preference = theme;
    try { localStorage.setItem(key, theme); } catch { /* Keep the in-page choice. */ }
    apply(theme);
  };
  window.workspaceTheme = Object.freeze({ set, get: () => document.documentElement.dataset.theme });
  system.addEventListener('change', () => { if (!preference) apply(system.matches ? 'dark' : 'day'); });
  apply(preference || (system.matches ? 'dark' : 'day'));
})();
