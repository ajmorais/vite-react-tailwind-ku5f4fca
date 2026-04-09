<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>SISOP - Sistema Operacional de Batalhão</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --verde: #1a3a2a;
      --verde-escuro: #0d1f17;
      --verde-medio: #2d5a3d;
      --verde-claro: #3d7a50;
      --verde-accent: #4caf6e;
      --amarelo: #f5c518;
      --vermelho: #c0392b;
      --vermelho-claro: #e74c3c;
      --cinza-escuro: #1a1a1a;
      --cinza-medio: #2d2d2d;
      --cinza-claro: #3d3d3d;
      --texto: #e8f0e8;
      --texto-muted: #8aaa8a;
      --borda: rgba(77, 175, 110, 0.2);
      --borda-forte: rgba(77, 175, 110, 0.4);
      --surface: rgba(13, 31, 23, 0.95);
      --surface-hover: rgba(45, 90, 61, 0.3);
      --radius: 6px;
      --radius-lg: 10px;
      --font-mono: 'IBM Plex Mono', monospace;
      --font-cond: 'Barlow Condensed', sans-serif;
      --font-body: 'Barlow', sans-serif;
    }
    html, body, #root { height: 100%; width: 100%; }
    body {
      background: var(--verde-escuro);
      color: var(--texto);
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.5;
      overflow: hidden;
    }
    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: var(--verde-escuro); }
    ::-webkit-scrollbar-thumb { background: var(--verde-medio); border-radius: 2px; }
    /* LAYOUT */
    .app { display: flex; height: 100vh; overflow: hidden; }
    .sidebar {
      width: 220px; min-width: 220px;
      background: var(--verde-escuro);
      border-right: 1px solid var(--borda);
      display: flex; flex-direction: column;
      transition: width 0.3s ease;
      overflow: hidden;
      z-index: 100;
    }
    .sidebar.collapsed { width: 56px; min-width: 56px; }
    .sidebar-header {
      padding: 16px 12px 12px;
      border-bottom: 1px solid var(--borda);
      display: flex; align-items: center; gap: 10px;
    }
    .sidebar-logo {
      width: 32px; height: 32px; min-width: 32px;
      background: var(--verde-accent);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-cond);
      font-weight: 700; font-size: 14px;
      color: var(--verde-escuro);
      letter-spacing: 0.5px;
    }
    .sidebar-title {
      font-family: var(--font-cond);
      font-weight: 700; font-size: 16px;
      color: var(--verde-accent);
      letter-spacing: 1px;
      white-space: nowrap; overflow: hidden;
    }
    .sidebar-subtitle {
      font-size: 9px; color: var(--texto-muted);
      letter-spacing: 2px; white-space: nowrap;
      font-family: var(--font-mono);
      text-transform: uppercase;
    }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: 8px 0; }
    .nav-section-label {
      font-size: 9px; font-family: var(--font-mono);
      color: var(--texto-muted); letter-spacing: 2px;
      padding: 12px 16px 4px;
      text-transform: uppercase;
      white-space: nowrap; overflow: hidden;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 16px; cursor: pointer;
      transition: all 0.15s; position: relative;
      font-size: 13px; color: var(--texto-muted);
      white-space: nowrap;
      border: none; background: none; width: 100%;
      text-align: left;
    }
    .nav-item:hover { background: var(--surface-hover); color: var(--texto); }
    .nav-item.active {
      background: rgba(77, 175, 110, 0.15);
      color: var(--verde-accent);
      border-right: 2px solid var(--verde-accent);
    }
    .nav-item.active::before {
      content: '';
      position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; background: var(--verde-accent);
      border-radius: 0 2px 2px 0;
    }
    .nav-icon {
      font-size: 16px; min-width: 20px;
      display: flex; align-items: center; justify-content: center;
    }
    .nav-text { overflow: hidden; text-overflow: ellipsis; }
    .nav-badge {
      margin-left: auto;
      background: var(--verde-accent);
      color: var(--verde-escuro);
      font-size: 10px; font-weight: 700;
      padding: 1px 6px; border-radius: 10px;
      font-family: var(--font-mono);
      min-width: 18px; text-align: center;
    }
    .sidebar-footer {
      border-top: 1px solid var(--borda);
      padding: 12px;
    }
    .user-card {
      display: flex; align-items: center; gap: 10px;
      padding: 8px; border-radius: var(--radius);
      background: var(--surface-hover);
      cursor: pointer; transition: all 0.15s;
    }
    .user-card:hover { background: rgba(77, 175, 110, 0.2); }
    .user-avatar {
      width: 32px; height: 32px; min-width: 32px;
      background: var(--verde-medio);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-cond);
      font-weight: 700; font-size: 13px; color: var(--verde-accent);
    }
    .user-info { overflow: hidden; }
    .user-name { font-size: 12px; font-weight: 600; color: var(--texto); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 10px; color: var(--texto-muted); font-family: var(--font-mono); white-space: nowrap; }
    /* MAIN */
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar {
      height: 52px; min-height: 52px;
      background: var(--verde-escuro);
      border-bottom: 1px solid var(--borda);
      display: flex; align-items: center;
      padding: 0 20px; gap: 12px;
    }
    .topbar-title {
      font-family: var(--font-cond);
      font-weight: 700; font-size: 18px;
      letter-spacing: 0.5px; flex: 1;
    }
    .topbar-badge {
      font-size: 9px; font-family: var(--font-mono);
      color: var(--verde-accent); letter-spacing: 2px;
      background: rgba(77, 175, 110, 0.1);
      border: 1px solid var(--borda-forte);
      padding: 2px 8px; border-radius: 4px;
    }
    .content { flex: 1; overflow-y: auto; padding: 20px; }
    /* BUTTONS */
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 7px; padding: 8px 16px;
      border-radius: var(--radius); border: 1px solid transparent;
      font-size: 13px; font-family: var(--font-body);
      font-weight: 500; cursor: pointer;
      transition: all 0.15s; white-space: nowrap;
    }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-primary {
      background: var(--verde-accent); color: var(--verde-escuro);
      border-color: var(--verde-accent); font-weight: 600;
    }
    .btn-primary:hover:not(:disabled) { background: #5cbf7e; border-color: #5cbf7e; }
    .btn-secondary {
      background: transparent; color: var(--verde-accent);
      border-color: var(--borda-forte);
    }
    .btn-secondary:hover:not(:disabled) { background: var(--surface-hover); border-color: var(--verde-accent); }
    .btn-danger {
      background: transparent; color: var(--vermelho-claro);
      border-color: rgba(231, 76, 60, 0.4);
    }
    .btn-danger:hover:not(:disabled) { background: rgba(231, 76, 60, 0.1); border-color: var(--vermelho-claro); }
    .btn-warning {
      background: transparent; color: var(--amarelo);
      border-color: rgba(245, 197, 24, 0.4);
    }
    .btn-warning:hover:not(:disabled) { background: rgba(245, 197, 24, 0.1); border-color: var(--amarelo); }
    .btn-sm { padding: 5px 10px; font-size: 12px; }
    .btn-lg { padding: 11px 22px; font-size: 15px; }
    .btn-icon {
      padding: 8px; background: transparent;
      color: var(--texto-muted); border-color: var(--borda);
    }
    .btn-icon:hover { color: var(--texto); border-color: var(--borda-forte); background: var(--surface-hover); }
    /* CARDS */
    .card {
      background: rgba(26, 58, 42, 0.4);
      border: 1px solid var(--borda);
      border-radius: var(--radius-lg); padding: 16px;
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px; padding-bottom: 10px;
      border-bottom: 1px solid var(--borda);
    }
    .card-title {
      font-family: var(--font-cond);
      font-weight: 600; font-size: 16px;
      letter-spacing: 0.5px;
    }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
    .stat-card {
      background: rgba(13, 31, 23, 0.8);
      border: 1px solid var(--borda);
      border-radius: var(--radius-lg); padding: 14px;
      text-align: center;
    }
    .stat-card.highlight { border-color: var(--verde-accent); }
    .stat-number {
      font-family: var(--font-mono);
      font-size: 28px; font-weight: 500;
      color: var(--verde-accent);
    }
    .stat-label { font-size: 11px; color: var(--texto-muted); margin-top: 2px; letter-spacing: 0.5px; }
    /* FORMS */
    .form-group { margin-bottom: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
    label { display: block; font-size: 11px; color: var(--texto-muted); font-family: var(--font-mono); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px; }
    input[type="text"], input[type="password"], input[type="email"], input[type="date"], input[type="time"], input[type="number"], select, textarea {
      width: 100%;
      background: rgba(13, 31, 23, 0.8);
      border: 1px solid var(--borda);
      border-radius: var(--radius);
      color: var(--texto);
      font-family: var(--font-body); font-size: 14px;
      padding: 9px 12px;
      transition: border-color 0.15s;
      outline: none;
      -webkit-appearance: none;
    }
    input:focus, select:focus, textarea:focus {
      border-color: var(--verde-accent);
      box-shadow: 0 0 0 3px rgba(77, 175, 110, 0.1);
    }
    select option { background: var(--verde-escuro); }
    textarea { resize: vertical; min-height: 80px; }
    .form-hint { font-size: 11px; color: var(--texto-muted); margin-top: 4px; }
    .required-star { color: var(--vermelho-claro); }
    .input-error { border-color: var(--vermelho-claro) !important; }
    .error-msg { font-size: 11px; color: var(--vermelho-claro); margin-top: 4px; }
    /* TAGS & BADGES */
    .badge {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 4px;
      font-size: 11px; font-family: var(--font-mono);
      font-weight: 500; white-space: nowrap;
    }
    .badge-green { background: rgba(77, 175, 110, 0.15); color: var(--verde-accent); border: 1px solid var(--borda-forte); }
    .badge-yellow { background: rgba(245, 197, 24, 0.15); color: var(--amarelo); border: 1px solid rgba(245, 197, 24, 0.3); }
    .badge-red { background: rgba(231, 76, 60, 0.15); color: var(--vermelho-claro); border: 1px solid rgba(231, 76, 60, 0.3); }
    .badge-blue { background: rgba(52, 152, 219, 0.15); color: #5dade2; border: 1px solid rgba(52, 152, 219, 0.3); }
    .badge-gray { background: rgba(200, 200, 200, 0.1); color: var(--texto-muted); border: 1px solid rgba(200, 200, 200, 0.2); }
    /* TABLE */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th {
      font-family: var(--font-mono); font-size: 10px;
      color: var(--texto-muted); letter-spacing: 1px;
      text-transform: uppercase; text-align: left;
      padding: 8px 12px; border-bottom: 1px solid var(--borda);
      white-space: nowrap;
    }
    td {
      padding: 10px 12px; font-size: 13px;
      border-bottom: 1px solid rgba(77, 175, 110, 0.08);
    }
    tr:hover td { background: rgba(77, 175, 110, 0.04); }
    tr:last-child td { border-bottom: none; }
    /* MODAL */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .modal {
      background: var(--verde-escuro);
      border: 1px solid var(--borda-forte);
      border-radius: var(--radius-lg);
      width: 100%; max-width: 560px;
      max-height: 90vh; overflow-y: auto;
    }
    .modal-header {
      padding: 16px 20px; border-bottom: 1px solid var(--borda);
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; background: var(--verde-escuro); z-index: 1;
    }
    .modal-title { font-family: var(--font-cond); font-weight: 700; font-size: 18px; letter-spacing: 0.5px; }
    .modal-body { padding: 20px; }
    .modal-footer { padding: 14px 20px; border-top: 1px solid var(--borda); display: flex; gap: 10px; justify-content: flex-end; }
    /* TOAST */
    .toast-container {
      position: fixed; top: 16px; right: 16px;
      z-index: 9999; display: flex; flex-direction: column; gap: 8px;
      max-width: 340px;
    }
    .toast {
      background: var(--verde-escuro);
      border: 1px solid var(--borda-forte);
      border-radius: var(--radius-lg); padding: 12px 16px;
      display: flex; align-items: flex-start; gap: 10px;
      animation: slideIn 0.25s ease;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .toast.toast-success { border-color: rgba(77, 175, 110, 0.6); }
    .toast.toast-error { border-color: rgba(231, 76, 60, 0.6); }
    .toast.toast-warning { border-color: rgba(245, 197, 24, 0.5); }
    .toast-icon { font-size: 16px; margin-top: 1px; }
    .toast-msg { font-size: 13px; flex: 1; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    /* LOGIN */
    .login-screen {
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center;
      background: radial-gradient(ellipse at top, #1a3a2a 0%, var(--verde-escuro) 60%);
      padding: 20px;
    }
    .login-card {
      width: 100%; max-width: 380px;
      background: rgba(26, 58, 42, 0.5);
      border: 1px solid var(--borda-forte);
      border-radius: 12px; padding: 36px 32px;
      backdrop-filter: blur(10px);
    }
    .login-logo {
      text-align: center; margin-bottom: 28px;
    }
    .login-emblem {
      width: 64px; height: 64px;
      background: var(--verde-accent);
      border-radius: 12px; margin: 0 auto 12px;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-cond); font-weight: 900;
      font-size: 24px; color: var(--verde-escuro);
      letter-spacing: 1px;
    }
    .login-system-name {
      font-family: var(--font-cond); font-weight: 700;
      font-size: 22px; color: var(--verde-accent);
      letter-spacing: 2px;
    }
    .login-system-sub {
      font-size: 10px; color: var(--texto-muted);
      font-family: var(--font-mono);
      letter-spacing: 3px; margin-top: 4px;
    }
    /* VTR CARDS */
    .vtr-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .vtr-type-card {
      border: 2px solid var(--borda); border-radius: var(--radius-lg);
      padding: 20px 16px; text-align: center; cursor: pointer;
      transition: all 0.2s; background: rgba(13, 31, 23, 0.6);
    }
    .vtr-type-card:hover { border-color: var(--verde-accent); background: rgba(77, 175, 110, 0.08); }
    .vtr-type-card.selected { border-color: var(--verde-accent); background: rgba(77, 175, 110, 0.15); }
    .vtr-type-icon { font-size: 36px; margin-bottom: 8px; }
    .vtr-type-label { font-family: var(--font-cond); font-weight: 700; font-size: 18px; letter-spacing: 1px; }
    /* CHECKLIST */
    .checklist-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid rgba(77, 175, 110, 0.08);
    }
    .checklist-item:last-child { border-bottom: none; }
    .checkbox-custom {
      width: 18px; height: 18px; min-width: 18px;
      border: 2px solid var(--borda-forte); border-radius: 4px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .checkbox-custom.checked {
      background: var(--verde-accent); border-color: var(--verde-accent);
      color: var(--verde-escuro); font-size: 11px;
    }
    /* MEMBER LIST */
    .member-chip {
      display: flex; align-items: center; gap: 8px;
      background: rgba(13, 31, 23, 0.8);
      border: 1px solid var(--borda); border-radius: var(--radius);
      padding: 6px 10px; margin-bottom: 6px;
    }
    .member-rank {
      font-family: var(--font-mono); font-size: 11px;
      color: var(--verde-accent); min-width: 40px;
    }
    .member-name { font-size: 13px; flex: 1; }
    /* AUDITORIA */
    .audit-entry {
      background: rgba(13, 31, 23, 0.5);
      border: 1px solid var(--borda);
      border-radius: var(--radius); padding: 10px 12px; margin-bottom: 8px;
    }
    .audit-timestamp {
      font-family: var(--font-mono); font-size: 10px; color: var(--texto-muted);
    }
    .audit-action { font-size: 13px; margin-top: 3px; }
    .audit-actor { font-size: 11px; color: var(--verde-accent); margin-top: 2px; font-family: var(--font-mono); }
    /* STATUS PILL */
    .status-online { color: var(--verde-accent); font-size: 10px; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--verde-accent); animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    /* PROGRESS BAR */
    .progress-bar { width: 100%; height: 4px; background: rgba(77, 175, 110, 0.15); border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--verde-accent); border-radius: 2px; transition: width 0.5s ease; }
    /* DIVIDER */
    .divider { height: 1px; background: var(--borda); margin: 16px 0; }
    /* SECTION HEADER */
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-title { font-family: var(--font-cond); font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    /* GRID 2 / 3 */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    /* EMPTY STATE */
    .empty-state {
      text-align: center; padding: 48px 20px;
      color: var(--texto-muted);
    }
    .empty-state-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
    .empty-state-text { font-size: 14px; }
    /* TIMELINE */
    .timeline-item { display: flex; gap: 12px; margin-bottom: 16px; }
    .timeline-dot { width: 8px; height: 8px; min-width: 8px; background: var(--verde-accent); border-radius: 50%; margin-top: 5px; position: relative; }
    .timeline-dot::after { content: ''; position: absolute; top: 8px; left: 3px; width: 2px; height: calc(100% + 10px); background: var(--borda); }
    .timeline-item:last-child .timeline-dot::after { display: none; }
    /* SEARCH */
    .search-wrap { position: relative; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--texto-muted); font-size: 14px; }
    .search-input { padding-left: 32px !important; }
    /* COLLAPSIBLE */
    .collapse-trigger { cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between; }
    .collapse-icon { transition: transform 0.2s; font-size: 12px; color: var(--texto-muted); }
    .collapse-icon.open { transform: rotate(180deg); }
    /* TABS */
    .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--borda); margin-bottom: 16px; }
    .tab {
      padding: 8px 14px; font-size: 13px; cursor: pointer;
      color: var(--texto-muted); border-bottom: 2px solid transparent;
      transition: all 0.15s; font-family: var(--font-cond);
      font-weight: 600; letter-spacing: 0.5px;
    }
    .tab:hover { color: var(--texto); }
    .tab.active { color: var(--verde-accent); border-bottom-color: var(--verde-accent); }
    /* SWITCH */
    .switch { position: relative; display: inline-block; width: 36px; height: 20px; }
    .switch input { display: none; }
    .slider {
      position: absolute; inset: 0; background: var(--cinza-claro);
      border-radius: 20px; cursor: pointer; transition: 0.2s;
    }
    .slider::before {
      content: ''; position: absolute; height: 14px; width: 14px;
      left: 3px; bottom: 3px; background: white;
      border-radius: 50%; transition: 0.2s;
    }
    input:checked + .slider { background: var(--verde-accent); }
    input:checked + .slider::before { transform: translateX(16px); }
    /* MOBILE */
    .menu-toggle { display: none; background: none; border: none; cursor: pointer; color: var(--texto); padding: 4px; font-size: 20px; }
    @media (max-width: 768px) {
      .sidebar {
        position: fixed; left: 0; top: 0; bottom: 0;
        transform: translateX(-100%); transition: transform 0.3s;
        width: 240px !important; z-index: 200;
      }
      .sidebar.mobile-open { transform: translateX(0); }
      .menu-toggle { display: flex; }
      .form-row, .form-row-3, .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .stat-grid { grid-template-columns: 1fr 1fr; }
      .mobile-overlay {
        display: none;
        position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 199;
      }
      .mobile-overlay.show { display: block; }
      .vtr-type-grid { grid-template-columns: 1fr 1fr; }
    }
    /* ALERT */
    .alert {
      border-radius: var(--radius); padding: 10px 14px; margin-bottom: 12px;
      font-size: 13px; display: flex; align-items: flex-start; gap: 8px;
    }
    .alert-warning { background: rgba(245, 197, 24, 0.1); border: 1px solid rgba(245, 197, 24, 0.3); color: var(--amarelo); }
    .alert-danger { background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); color: var(--vermelho-claro); }
    .alert-info { background: rgba(52, 152, 219, 0.1); border: 1px solid rgba(52, 152, 219, 0.3); color: #5dade2; }
    .alert-success { background: rgba(77, 175, 110, 0.1); border: 1px solid var(--borda-forte); color: var(--verde-accent); }
    /* FILE UPLOAD */
    .file-upload-area {
      border: 2px dashed var(--borda); border-radius: var(--radius-lg);
      padding: 24px; text-align: center; cursor: pointer;
      transition: all 0.2s;
    }
    .file-upload-area:hover { border-color: var(--verde-accent); background: rgba(77, 175, 110, 0.05); }
    .file-preview {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; margin-top: 12px;
    }
    .file-thumb { border-radius: var(--radius); overflow: hidden; border: 1px solid var(--borda); aspect-ratio: 1; background: rgba(13,31,23,0.5); display: flex; align-items: center; justify-content: center; font-size: 24px; }
    /* LOADING */
    .spinner {
      width: 20px; height: 20px; border: 2px solid var(--borda);
      border-top-color: var(--verde-accent); border-radius: 50%;
      animation: spin 0.7s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-screen {
      height: 100vh; display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 16px; background: var(--verde-escuro);
    }
    /* HEADER TAG */
    .page-tag {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px;
      color: var(--verde-accent); text-transform: uppercase;
      background: rgba(77, 175, 110, 0.1); border: 1px solid var(--borda);
      padding: 2px 8px; border-radius: 3px;
    }
    /* INACTIVIDADE BANNER */
    .inactivity-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9000;
      background: var(--amarelo); color: #1a1a00;
      padding: 8px 20px; text-align: center;
      font-size: 13px; font-weight: 600; font-family: var(--font-mono);
    }
    .flex { display: flex; } .items-center { align-items: center; } .justify-between { justify-content: space-between; }
    .gap-2 { gap: 8px; } .gap-3 { gap: 12px; } .gap-4 { gap: 16px; }
    .mt-1 { margin-top: 4px; } .mt-2 { margin-top: 8px; } .mt-3 { margin-top: 12px; } .mt-4 { margin-top: 16px; }
    .mb-2 { margin-bottom: 8px; } .mb-3 { margin-bottom: 12px; } .mb-4 { margin-bottom: 16px; }
    .ml-auto { margin-left: auto; }
    .text-muted { color: var(--texto-muted); }
    .text-accent { color: var(--verde-accent); }
    .text-danger { color: var(--vermelho-claro); }
    .text-warning { color: var(--amarelo); }
    .text-sm { font-size: 12px; } .text-xs { font-size: 11px; }
    .font-mono { font-family: var(--font-mono); }
    .font-cond { font-family: var(--font-cond); }
    .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .w-full { width: 100%; }
    .pointer { cursor: pointer; }
    .select-none { user-select: none; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useCallback, useRef, createContext, useContext } = React;

    // ─── FIREBASE CONFIG ─────────────────────────────────────────────────────
    // TODO: Substitua com suas credenciais do Firebase Console
    const firebaseConfig = {
      apiKey: "AIzaSyDEMO_SUBSTITUA_COM_SUA_CHAVE",
      authDomain: "seu-projeto.firebaseapp.com",
      projectId: "seu-projeto",
      storageBucket: "seu-projeto.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    };

    // Inicializa Firebase apenas se não estiver em modo demo
    let db = null, auth = null;
    const IS_DEMO = true; // Mude para false em produção com config real

    if (!IS_DEMO) {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
    }

    // ─── CONTEXTOS ────────────────────────────────────────────────────────────
    const AppContext = createContext(null);
    const ToastContext = createContext(null);

    // ─── DADOS DEMO ──────────────────────────────────────────────────────────
    const DEMO_DATA = {
      users: [
        { id: 'u1', matricula: '12345', nome: 'Carlos Eduardo Silva', posto: 'SD', perfil: 'operacional', status: 'Ativo', opm: '1ª CIA', senha: '123456' },
        { id: 'u2', matricula: '22222', nome: 'Ana Paula Ferreira', posto: 'CB', perfil: 'fiscal_policiamento', status: 'Ativo', opm: '1ª CIA', senha: '123456' },
        { id: 'u3', matricula: '33333', nome: 'Roberto Mendes', posto: 'SGT', perfil: 'armeiro', status: 'Ativo', opm: 'GAL', senha: '123456' },
        { id: 'u4', matricula: '44444', nome: 'João Gomes', posto: 'TEN', perfil: 'oficial', status: 'Ativo', opm: 'GAL', senha: '123456' },
        { id: 'u5', matricula: '00000', nome: 'Dev Admin', posto: 'DEV', perfil: 'dev', status: 'Ativo', opm: 'GAL', senha: '000000' },
      ],
      viaturas: [
        { id: 'v1', tipo: 'CARRO', modelo: 'FORD RANGER', prefixo: 'BPM-01', placa: 'ABC-1234', status: 'Disponível', km: 45200 },
        { id: 'v2', tipo: 'CARRO', modelo: 'CHEVROLET S10', prefixo: 'BPM-02', placa: 'DEF-5678', status: 'Disponível', km: 62300 },
        { id: 'v3', tipo: 'MOTO', modelo: 'HONDA CB 500', prefixo: 'MT-01', placa: 'GHI-9012', status: 'Disponível', km: 18700 },
        { id: 'v4', tipo: 'CARRO', modelo: 'FORD RANGER', prefixo: 'BPM-03', placa: 'JKL-3456', status: 'Em Serviço', km: 38900 },
        { id: 'v5', tipo: 'MOTO', modelo: 'YAMAHA FAZER 250', prefixo: 'MT-02', placa: 'MNO-7890', status: 'Disponível', km: 22100 },
      ],
      servicos: [
        { id: 's1', turno: 'TARDE', tipo: 'POG', modalidade: 'POG', opm: '1ª CIA', cidade: 'Sobral', area: 'CENTRO', dataInicio: new Date().toISOString(), status: 'Ativo', vtr: { prefixo: 'BPM-01', modelo: 'FORD RANGER', tipo: 'CARRO' }, membros: [{ id: 'u1', nome: 'Carlos Eduardo Silva', posto: 'SD', matricula: '12345' }] },
      ],
      ocorrencias: [
        { id: 'o1', natureza: 'ABORDAGEM DE VEÍCULO', procedimento: 'BO', descricao: 'Veículo abordado, sem irregularidade', servico: 's1', status: 'Registrada', dataHora: new Date().toISOString() },
      ],
      materiais: [
        { id: 'm1', nome: 'PISTOLA PT100', tipo: 'ARMA', quantidade: 10, disponiveis: 8, serie: 'MULTI', status: 'Ativo' },
        { id: 'm2', nome: 'COLETE BALÍSTICO', tipo: 'EPI', quantidade: 20, disponiveis: 15, serie: 'MULTI', status: 'Ativo' },
        { id: 'm3', nome: 'RÁDIO COMUNICADOR', tipo: 'EQUIPAMENTO', quantidade: 15, disponiveis: 12, serie: 'MULTI', status: 'Ativo' },
        { id: 'm4', nome: 'ALGEMAS', tipo: 'ACESSÓRIO', quantidade: 30, disponiveis: 25, serie: 'MULTI', status: 'Ativo' },
      ],
      cautelas: [
        { id: 'c1', material: 'PISTOLA PT100', policial: 'Carlos Eduardo Silva', matricula: '12345', quantidade: 1, status: 'Entregue', dataEntrega: new Date().toISOString(), armeiro: 'Roberto Mendes' },
      ],
      logs: [
        { id: 'l1', tipo: 'LOGIN', ator: 'Carlos Eduardo Silva (12345)', acao: 'Login realizado', ts: new Date().toISOString() },
        { id: 'l2', tipo: 'ENTRADA', ator: 'Ana Paula Ferreira (22222)', acao: 'Entrada de serviço registrada – VTR BPM-01 / ÁREA CENTRO', ts: new Date(Date.now()-3600000).toISOString() },
        { id: 'l3', tipo: 'CAUTELA', ator: 'Roberto Mendes (33333)', acao: 'Material PISTOLA PT100 entregue para SD Carlos Eduardo Silva (12345)', ts: new Date(Date.now()-7200000).toISOString() },
      ]
    };

    // ─── CONSTANTES ───────────────────────────────────────────────────────────
    const TURNOS = ['MANHÃ', 'TARDE', 'NOITE', 'INTEGRAL'];
    const TIPOS_SERVICO = ['POLICIAMENTO OSTENSIVO', 'PATRULHAMENTO', 'OPERAÇÃO ESPECIAL', 'APOIO', 'EVENTO'];
    const MODALIDADES = ['POG', 'FT', 'MOTOPATRULHAMENTO', 'PATRULHAMENTO ESCOLAR', 'RÁDIO PATRULHA', 'CANIL', 'RONDESP'];
    const OPMS = ['1ª CIA', '2ª CIA', '3ª CIA', 'GAL', 'ROCAM', 'OUTRA'];
    const AREAS_POR_OPM = {
      '1ª CIA': ['CENTRO', 'NORTE', 'SUL'],
      '2ª CIA': ['LESTE', 'OESTE', 'INDUSTRIAL'],
      '3ª CIA': ['RURAL', 'INTERIOR'],
      'GAL': ['GERAL'],
      'ROCAM': ['METROPOLITANA'],
    };
    const CIDADES = ['Sobral', 'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Crato', 'Iguatu', 'Quixadá', 'Outras'];
    const POSTOS = ['SD', 'CB', 'SGT', '2º SGT', '1º SGT', 'SUB TEN', 'CADETE', '2º TEN', '1º TEN', 'CAP', 'MAJ', 'TEN CEL', 'CEL'];
    const PERFIS_LABELS = {
      operacional: 'Operacional', armeiro: 'Armeiro', administrativo: 'Administrativo',
      adm_p4: 'ADM P4', fiscal_policiamento: 'Fiscal de Policiamento',
      oficial_p3: 'Oficial P3', oficial_p4: 'Oficial P4', oficial: 'Oficial',
      oficial_superior: 'Oficial Superior', dev: 'Desenvolvedor'
    };
    const PERFIL_WEIGHT = { operacional: 1, armeiro: 2, administrativo: 3, adm_p4: 4, fiscal_policiamento: 5, oficial_p3: 6, oficial_p4: 7, oficial: 8, oficial_superior: 9, dev: 99 };
    const NATUREZAS_OCORRENCIA = ['ABORDAGEM DE VEÍCULO','ABORDAGEM DE PESSOA','APOIO A OCORRÊNCIA','APF - PRISÃO EM FLAGRANTE','APREENSÃO DE DROGAS','APREENSÃO DE ARMA','AÇÃO PREVENTIVA','COLISÃO DE TRÂNSITO','OCORRÊNCIA DE TRÂNSITO','HOMICÍDIO','ROUBO','FURTO','LESÃO CORPORAL','AMEAÇA','VIOLÊNCIA DOMÉSTICA','PERTURBAÇÃO DO SOSSEGO','VÍTIMA DE ACIDENTE','SOCORRO DE URGÊNCIA','ATENDIMENTO AO CIDADÃO','OUTRAS'];
    const PROCEDIMENTOS = ['BO', 'TCO', 'APF', 'ROAT', 'ATCO', 'SEM OCORRÊNCIA'];
    const TIPOS_MATERIAL = ['ARMA', 'EPI', 'EQUIPAMENTO', 'ACESSÓRIO', 'VEÍCULO', 'OUTRO'];
    const MODELOS_CARRO = ['FORD RANGER','CHEVROLET S10','VOLKSWAGEN AMAROK','TOYOTA HILUX','FIAT TORO','CHEVROLET SPIN','RENAULT OROCH','TOYOTA SW4'];
    const MODELOS_MOTO = ['HONDA CB 500','HONDA BROS 160','YAMAHA FAZER 250','KAWASAKI VERSYS 650','BMW F 850 GS','HONDA TRANSALP'];
    const CHECKLIST_CARRO = {
      'DOCUMENTAÇÃO': ['CRLV em dia','Apólice de seguro','Licença de uso PM'],
      'EQUIPAMENTOS': ['Extintor de incêndio','Triângulo de sinalização','Macaco e chave de roda','Rádio comunicador','Lanterna tática'],
      'ARMAMENTO': ['Armamento conferido','Munição conferida','Colete balístico'],
      'VISTORIA': ['Lanternas dianteiras','Lanternas traseiras','Giroflex','Sirene','Vidros intactos','Pneus calibrados','Nível de combustível','Nível de óleo','Hodômetro registrado']
    };
    const CHECKLIST_MOTO = {
      'DOCUMENTAÇÃO': ['CRLV em dia','Apólice de seguro'],
      'EPI': ['Capacete certificado','Colete balístico','Joelheira','Cotoveleira','Bota de proteção'],
      'EQUIPAMENTOS': ['Rádio comunicador','Lanterna tática'],
      'VISTORIA': ['Lanternas dianteiras','Lanternas traseiras','Freios funcionando','Pneus calibrados','Nível de combustível','Hodômetro registrado','Corrente em dia']
    };
    const FOTOS_OBRIGATORIAS = ['FRONTAL','TRASEIRA','LATERAL ESQUERDA','LATERAL DIREITA','PNEUS','MOTOR','PAINEL','HODÔMETRO'];

    // ─── UTILITÁRIOS ─────────────────────────────────────────────────────────
    const fmtDate = (d) => new Date(d).toLocaleDateString('pt-BR');
    const fmtDateTime = (d) => new Date(d).toLocaleString('pt-BR');
    const fmtTime = (d) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const genId = () => Math.random().toString(36).substr(2, 9);
    const getInitials = (name) => name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();
    const hasPermission = (user, minPerfil) => {
      return (PERFIL_WEIGHT[user?.perfil] || 0) >= (PERFIL_WEIGHT[minPerfil] || 0);
    };

    // ─── TOAST PROVIDER ──────────────────────────────────────────────────────
    const ToastProvider = ({ children }) => {
      const [toasts, setToasts] = useState([]);
      const addToast = useCallback((msg, type = 'success', duration = 4000) => {
        const id = genId();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
      }, []);
      const icons = { success: '✓', error: '✗', warning: '⚠', info: 'i' };
      return (
        <ToastContext.Provider value={addToast}>
          {children}
          <div className="toast-container">
            {toasts.map(t => (
              <div key={t.id} className={`toast toast-${t.type}`}>
                <span className="toast-icon">{icons[t.type]}</span>
                <span className="toast-msg">{t.msg}</span>
              </div>
            ))}
          </div>
        </ToastContext.Provider>
      );
    };

    // ─── COMPONENTES BASE ────────────────────────────────────────────────────
    const Modal = ({ title, onClose, children, footer, size = 'md' }) => (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxWidth: size === 'lg' ? 700 : size === 'xl' ? 900 : 560 }}>
          <div className="modal-header">
            <span className="modal-title">{title}</span>
            <button className="btn btn-icon btn-sm" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    );

    const Checkbox = ({ checked, onChange, label }) => (
      <div className="checklist-item">
        <div className={`checkbox-custom ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)}>
          {checked && '✓'}
        </div>
        <span style={{ fontSize: 13, cursor: 'pointer' }} onClick={() => onChange(!checked)}>{label}</span>
      </div>
    );

    const Spinner = ({ size = 20 }) => (
      <div className="spinner" style={{ width: size, height: size }} />
    );

    const EmptyState = ({ icon = '📋', text = 'Nenhum registro encontrado' }) => (
      <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <div className="empty-state-text">{text}</div>
      </div>
    );

    const ConfirmModal = ({ title, msg, onConfirm, onCancel, btnLabel = 'Confirmar', danger = false }) => (
      <Modal title={title} onClose={onCancel}
        footer={<>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{btnLabel}</button>
        </>}>
        <p style={{ fontSize: 14 }}>{msg}</p>
      </Modal>
    );

    // ─── TELA: LOGIN ─────────────────────────────────────────────────────────
    const LoginScreen = ({ onLogin }) => {
      const toast = useContext(ToastContext);
      const [matricula, setMatricula] = useState('');
      const [senha, setSenha] = useState('');
      const [loading, setLoading] = useState(false);
      const [err, setErr] = useState('');

      const handleLogin = async () => {
        setErr('');
        if (!matricula || !senha) { setErr('Preencha todos os campos'); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 800)); // Simula req.
        const user = DEMO_DATA.users.find(u => u.matricula === matricula && u.senha === senha);
        if (!user) { setErr('Matrícula ou senha incorretos'); setLoading(false); return; }
        if (user.status !== 'Ativo') { setErr('Usuário inativo. Contate a administração.'); setLoading(false); return; }
        // AUDITORIA: Log de login
        DEMO_DATA.logs.unshift({ id: genId(), tipo: 'LOGIN', ator: `${user.nome} (${user.matricula})`, acao: `Login realizado – Perfil: ${PERFIS_LABELS[user.perfil]}`, ts: new Date().toISOString() });
        toast(`Bem-vindo, ${user.posto} ${user.nome.split(' ')[0]}!`, 'success');
        onLogin(user);
        setLoading(false);
      };

      return (
        <div className="login-screen">
          <div className="login-card">
            <div className="login-logo">
              <div className="login-emblem">PM</div>
              <div className="login-system-name">SISOP</div>
              <div className="login-system-sub">Sistema Operacional · Batalhão</div>
            </div>
            {err && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠ {err}</div>}
            <div className="form-group">
              <label>Matrícula</label>
              <input type="text" placeholder="Ex: 12345" value={matricula}
                onChange={e => setMatricula(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" placeholder="••••••" value={senha}
                onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button className="btn btn-primary w-full btn-lg" onClick={handleLogin} disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><Spinner size={16} /> Verificando...</> : 'ENTRAR NO SISTEMA'}
            </button>
            <div className="alert alert-info" style={{ marginTop: 16 }}>
              <div><strong>Demo:</strong> matricula 12345 / senha 123456<br/>
              Fiscal: 22222/123456 · Armeiro: 33333/123456<br/>
              Oficial: 44444/123456 · Dev: 00000/000000</div>
            </div>
          </div>
        </div>
      );
    };

    // ─── TELA: DASHBOARD / PANORAMA ──────────────────────────────────────────
    const Dashboard = () => {
      const { user } = useContext(AppContext);
      const servicosAtivos = DEMO_DATA.servicos.filter(s => s.status === 'Ativo');
      const totalPoliciais = servicosAtivos.reduce((acc, s) => acc + (s.membros?.length || 0), 0);
      const vtrsEmServico = new Set(servicosAtivos.map(s => s.vtr?.prefixo).filter(Boolean)).size;
      const ocHoje = DEMO_DATA.ocorrencias.filter(o => fmtDate(o.dataHora) === fmtDate(new Date())).length;

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Panorama Gerencial</div>
              <div className="section-title" style={{ marginTop: 6 }}>Dashboard Operacional</div>
            </div>
            <div className="status-online">
              <div className="status-dot" />
              <span>TEMPO REAL</span>
            </div>
          </div>

          <div className="stat-grid" style={{ marginBottom: 20 }}>
            {[
              { n: servicosAtivos.length, label: 'Equipes em Serviço', highlight: true },
              { n: totalPoliciais, label: 'Policiais Escalados' },
              { n: vtrsEmServico, label: 'VTRs em Uso' },
              { n: ocHoje, label: 'Ocorrências Hoje' },
              { n: DEMO_DATA.cautelas.filter(c => c.status === 'Entregue').length, label: 'Cautelas Ativas' },
              { n: DEMO_DATA.materiais.reduce((a, m) => a + m.disponiveis, 0), label: 'Itens Disponíveis' },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.highlight ? 'highlight' : ''}`}>
                <div className="stat-number">{s.n}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">⚡ Equipes em Serviço</span>
                <span className="badge badge-green">{servicosAtivos.length} ativas</span>
              </div>
              {servicosAtivos.length === 0 ? <EmptyState icon="🚓" text="Nenhuma equipe em serviço" /> : (
                servicosAtivos.map(s => (
                  <div key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--borda)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="badge badge-green" style={{ marginRight: 8 }}>{s.vtr?.prefixo || '—'}</span>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-cond)', fontWeight: 600 }}>{s.modalidade} · {s.area}</span>
                      </div>
                      <span className="badge badge-blue">{s.turno}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--texto-muted)', marginTop: 4 }}>
                      {s.membros?.length || 0} policial(is) · {fmtTime(s.dataInicio)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">📜 Auditoria Recente</span>
              </div>
              {DEMO_DATA.logs.slice(0, 6).map(l => (
                <div key={l.id} className="audit-entry">
                  <div className="audit-timestamp">{fmtDateTime(l.ts)}</div>
                  <div className="audit-action">{l.acao}</div>
                  <div className="audit-actor">{l.ator}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">
              <span className="card-title">🚗 Status da Frota</span>
              <span className="badge badge-gray">{DEMO_DATA.viaturas.length} viaturas</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Prefixo</th><th>Modelo</th><th>Tipo</th><th>Placa</th><th>KM</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_DATA.viaturas.map(v => (
                    <tr key={v.id}>
                      <td><span className="font-mono text-accent">{v.prefixo}</span></td>
                      <td style={{ fontWeight: 500 }}>{v.modelo}</td>
                      <td><span className="badge badge-gray">{v.tipo}</span></td>
                      <td className="font-mono">{v.placa}</td>
                      <td className="font-mono">{v.km?.toLocaleString()} km</td>
                      <td><span className={`badge ${v.status === 'Disponível' ? 'badge-green' : v.status === 'Em Serviço' ? 'badge-yellow' : 'badge-red'}`}>{v.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

    // ─── TELA: ENTRADA DE SERVIÇO ─────────────────────────────────────────────
    const EntradaServico = () => {
      const { user } = useContext(AppContext);
      const toast = useContext(ToastContext);
      const [step, setStep] = useState(1); // 1=form, 2=vtr, 3=checklist, 4=confirmado
      const [form, setForm] = useState({
        data: new Date().toISOString().split('T')[0],
        turno: '', tipo: '', modalidade: '', opm: '', cidade: '',
        area: '', areaManual: ''
      });
      const [vtrForm, setVtrForm] = useState({ tipo: '', modelo: '', prefixo: '', placa: '' });
      const [membros, setMembros] = useState([{ ...user, pm_id: user.id }]);
      const [searchPM, setSearchPM] = useState('');
      const [checklist, setChecklist] = useState({});
      const [fotos, setFotos] = useState({});
      const [fotosSimuladas, setFotosSimuladas] = useState({});
      const [erros, setErros] = useState({});
      const [conflito, setConflito] = useState(null);
      const [kmAtual, setKmAtual] = useState('');
      const [declaracao, setDeclaracao] = useState(false);

      const areaOptions = form.opm && form.opm !== 'OUTRA' ? (AREAS_POR_OPM[form.opm] || []) : [];
      const pmDisponivel = DEMO_DATA.users.filter(u =>
        u.status === 'Ativo' && u.id !== user.id &&
        !membros.find(m => m.id === u.id) &&
        (u.nome.toLowerCase().includes(searchPM.toLowerCase()) || u.matricula.includes(searchPM))
      );
      const checklistTemplate = vtrForm.tipo === 'MOTO' ? CHECKLIST_MOTO : CHECKLIST_CARRO;

      const validateStep1 = () => {
        const e = {};
        if (!form.turno) e.turno = 'Obrigatório';
        if (!form.tipo) e.tipo = 'Obrigatório';
        if (!form.modalidade) e.modalidade = 'Obrigatório';
        if (!form.opm) e.opm = 'Obrigatório';
        if (!form.cidade) e.cidade = 'Obrigatório';
        if (form.opm !== 'OUTRA' && !form.area) e.area = 'Obrigatório';
        if (form.opm === 'OUTRA' && !form.areaManual) e.areaManual = 'Obrigatório';
        if (membros.length === 0) e.membros = 'Adicione ao menos um policial';
        setErros(e);
        return Object.keys(e).length === 0;
      };

      const validateStep2 = () => {
        const e = {};
        if (!vtrForm.tipo) e.tipo = 'Selecione o tipo';
        if (!vtrForm.modelo) e.modelo = 'Obrigatório';
        if (!vtrForm.prefixo) e.prefixo = 'Obrigatório';
        if (!kmAtual) e.km = 'Informe o KM atual';
        setErros(e);
        return Object.keys(e).length === 0;
      };

      const validateStep3 = () => {
        const totalItems = Object.values(checklistTemplate).flat().length;
        const checked = Object.values(checklist).filter(Boolean).length;
        const fotosOK = FOTOS_OBRIGATORIAS.every(f => fotosSimuladas[f]);
        if (checked < totalItems) { toast(`Complete todos os ${totalItems} itens do checklist`, 'error'); return false; }
        if (!fotosOK) { toast('Todas as fotos obrigatórias devem ser registradas', 'error'); return false; }
        if (!declaracao) { toast('Assine a declaração de responsabilidade', 'error'); return false; }
        return true;
      };

      const adicionarPM = (pm) => {
        const emServico = DEMO_DATA.servicos.find(s => s.status === 'Ativo' && s.membros?.find(m => m.id === pm.id));
        if (emServico) {
          setConflito({ pm, servico: emServico });
        } else {
          setMembros(prev => [...prev, { ...pm, pm_id: pm.id }]);
          setSearchPM('');
        }
      };

      const confirmarRemanejamento = () => {
        const { pm, servico } = conflito;
        // AUDITORIA: Remanejamento
        DEMO_DATA.logs.unshift({
          id: genId(), tipo: 'REMANEJAMENTO',
          ator: `${user.posto} ${user.nome} (${user.matricula})`,
          acao: `${pm.posto} ${pm.nome} (${pm.matricula}) remanejado(a) para VTR + ÁREA ${form.area || form.areaManual}`,
          ts: new Date().toISOString()
        });
        // Remove do serviço anterior
        const idx = DEMO_DATA.servicos.findIndex(s => s.id === servico.id);
        if (idx !== -1) DEMO_DATA.servicos[idx].membros = DEMO_DATA.servicos[idx].membros.filter(m => m.id !== pm.id);
        setMembros(prev => [...prev, { ...pm, pm_id: pm.id }]);
        setConflito(null);
        toast(`${pm.posto} ${pm.nome} remanejado(a) com auditoria registrada`, 'warning');
      };

      const finalizarEntrada = () => {
        const novoServico = {
          id: genId(),
          ...form,
          area: form.opm === 'OUTRA' ? form.areaManual : form.area,
          vtr: { tipo: vtrForm.tipo, modelo: vtrForm.modelo, prefixo: vtrForm.prefixo, placa: vtrForm.placa },
          kmInicio: parseInt(kmAtual),
          membros: membros.map(m => ({ id: m.id, nome: m.nome, posto: m.posto, matricula: m.matricula })),
          status: 'Ativo',
          dataInicio: new Date().toISOString(),
          checklist, fotos: fotosSimuladas,
        };
        DEMO_DATA.servicos.push(novoServico);
        // Atualiza VTR
        const vIdx = DEMO_DATA.viaturas.findIndex(v => v.prefixo === vtrForm.prefixo);
        if (vIdx !== -1) DEMO_DATA.viaturas[vIdx].status = 'Em Serviço';
        // AUDITORIA
        DEMO_DATA.logs.unshift({
          id: genId(), tipo: 'ENTRADA',
          ator: `${user.posto} ${user.nome} (${user.matricula})`,
          acao: `Entrada de serviço registrada – VTR ${vtrForm.prefixo} / ÁREA ${novoServico.area} / ${membros.length} policial(is)`,
          ts: new Date().toISOString()
        });
        toast('Entrada de serviço registrada com sucesso!', 'success');
        setStep(4);
      };

      if (step === 4) return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div className="section-title" style={{ marginBottom: 8 }}>Entrada Registrada!</div>
          <p style={{ color: 'var(--texto-muted)', marginBottom: 24 }}>VTR {vtrForm.prefixo} · {form.modalidade} · {form.opm === 'OUTRA' ? form.areaManual : form.area}</p>
          <button className="btn btn-primary" onClick={() => setStep(1)}>Nova Entrada</button>
        </div>
      );

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Operacional</div>
              <div className="section-title" style={{ marginTop: 6 }}>Entrada de Serviço</div>
            </div>
          </div>

          {/* STEPPER */}
          <div className="flex gap-2" style={{ marginBottom: 20 }}>
            {['Dados do Serviço', 'Seleção de VTR', 'Checklist e Fotos'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                  background: step > i + 1 ? 'var(--verde-accent)' : step === i + 1 ? 'rgba(77,175,110,0.3)' : 'rgba(77,175,110,0.1)',
                  color: step >= i + 1 ? 'var(--verde-accent)' : 'var(--texto-muted)',
                  border: `2px solid ${step >= i + 1 ? 'var(--verde-accent)' : 'var(--borda)'}`,
                  fontFamily: 'var(--font-mono)'
                }}>{step > i + 1 ? '✓' : i + 1}</div>
                <span style={{ fontSize: 12, color: step >= i + 1 ? 'var(--texto)' : 'var(--texto-muted)', whiteSpace: 'nowrap', display: 'none' }} className="desktop-only">{s}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? 'var(--verde-accent)' : 'var(--borda)', minWidth: 20 }} />}
              </div>
            ))}
          </div>

          {/* STEP 1: FORM */}
          {step === 1 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">📋 Dados do Serviço</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data <span className="required-star">*</span></label>
                  <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Turno <span className="required-star">*</span></label>
                  <select value={form.turno} onChange={e => setForm(p => ({ ...p, turno: e.target.value }))} className={erros.turno ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {TURNOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {erros.turno && <div className="error-msg">{erros.turno}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Serviço <span className="required-star">*</span></label>
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className={erros.tipo ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {TIPOS_SERVICO.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {erros.tipo && <div className="error-msg">{erros.tipo}</div>}
                </div>
                <div className="form-group">
                  <label>Modalidade <span className="required-star">*</span></label>
                  <select value={form.modalidade} onChange={e => setForm(p => ({ ...p, modalidade: e.target.value }))} className={erros.modalidade ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {MODALIDADES.map(m => <option key={m}>{m}</option>)}
                  </select>
                  {erros.modalidade && <div className="error-msg">{erros.modalidade}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>OPM <span className="required-star">*</span></label>
                  <select value={form.opm} onChange={e => setForm(p => ({ ...p, opm: e.target.value, area: '' }))} className={erros.opm ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {OPMS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cidade <span className="required-star">*</span></label>
                  <select value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} className={erros.cidade ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {CIDADES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                {form.opm === 'OUTRA' ? (
                  <>
                    <label>Área de Atuação (Manual) <span className="required-star">*</span></label>
                    <input type="text" placeholder="Descreva a área de atuação" value={form.areaManual}
                      onChange={e => setForm(p => ({ ...p, areaManual: e.target.value }))} className={erros.areaManual ? 'input-error' : ''} />
                  </>
                ) : (
                  <>
                    <label>Área de Atuação <span className="required-star">*</span></label>
                    <select value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} className={erros.area ? 'input-error' : ''} disabled={!form.opm}>
                      <option value="">Selecione</option>
                      {areaOptions.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </>
                )}
                {(erros.area || erros.areaManual) && <div className="error-msg">{erros.area || erros.areaManual}</div>}
              </div>

              <div className="divider" />
              <div className="card-title" style={{ marginBottom: 12 }}>👮 Equipe</div>
              {membros.map((m, i) => (
                <div key={m.id} className="member-chip">
                  <span className="member-rank">{m.posto}</span>
                  <span className="member-name">{m.nome}</span>
                  <span className="font-mono text-xs text-muted">{m.matricula}</span>
                  {i > 0 && <button className="btn btn-sm" style={{ padding: '2px 8px', marginLeft: 'auto', color: 'var(--vermelho-claro)', background: 'none', border: 'none' }} onClick={() => setMembros(p => p.filter(pm => pm.id !== m.id))}>✕</button>}
                  {i === 0 && <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Responsável</span>}
                </div>
              ))}
              <div className="search-wrap" style={{ marginTop: 10 }}>
                <span className="search-icon">🔍</span>
                <input type="text" className="search-input" placeholder="Buscar policial por nome ou matrícula..."
                  value={searchPM} onChange={e => setSearchPM(e.target.value)} />
              </div>
              {searchPM && (
                <div style={{ background: 'rgba(13,31,23,0.95)', border: '1px solid var(--borda)', borderRadius: 'var(--radius)', marginTop: 4, maxHeight: 200, overflowY: 'auto' }}>
                  {pmDisponivel.length === 0 ? (
                    <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--texto-muted)' }}>Nenhum policial encontrado</div>
                  ) : pmDisponivel.map(pm => (
                    <div key={pm.id} onClick={() => adicionarPM(pm)} style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--borda)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <strong>{pm.posto} {pm.nome}</strong> <span style={{ color: 'var(--texto-muted)', fontSize: 11 }}>{pm.matricula}</span>
                    </div>
                  ))}
                </div>
              )}
              {erros.membros && <div className="error-msg" style={{ marginTop: 4 }}>{erros.membros}</div>}

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-lg" onClick={() => validateStep1() && setStep(2)}>Próximo: Seleção de VTR →</button>
              </div>
            </div>
          )}

          {/* STEP 2: VTR */}
          {step === 2 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🚓 Seleção de Viatura</span>
              </div>
              <label>Tipo de Viatura <span className="required-star">*</span></label>
              <div className="vtr-type-grid" style={{ marginTop: 8 }}>
                {[{ tipo: 'CARRO', icon: '🚗' }, { tipo: 'MOTO', icon: '🏍️' }].map(({ tipo, icon }) => (
                  <div key={tipo} className={`vtr-type-card ${vtrForm.tipo === tipo ? 'selected' : ''}`}
                    onClick={() => setVtrForm(p => ({ ...p, tipo, modelo: '', prefixo: '', placa: '' }))}>
                    <div className="vtr-type-icon">{icon}</div>
                    <div className="vtr-type-label">{tipo}</div>
                  </div>
                ))}
              </div>
              {erros.tipo && <div className="error-msg" style={{ marginBottom: 10 }}>{erros.tipo}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label>Modelo <span className="required-star">*</span></label>
                  <select value={vtrForm.modelo} onChange={e => setVtrForm(p => ({ ...p, modelo: e.target.value }))} disabled={!vtrForm.tipo} className={erros.modelo ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {(vtrForm.tipo === 'MOTO' ? MODELOS_MOTO : MODELOS_CARRO).map(m => <option key={m}>{m}</option>)}
                  </select>
                  {erros.modelo && <div className="error-msg">{erros.modelo}</div>}
                </div>
                <div className="form-group">
                  <label>Prefixo / Placa <span className="required-star">*</span></label>
                  <select value={vtrForm.prefixo} onChange={e => {
                    const vtr = DEMO_DATA.viaturas.find(v => v.prefixo === e.target.value);
                    setVtrForm(p => ({ ...p, prefixo: e.target.value, placa: vtr?.placa || '' }));
                  }} disabled={!vtrForm.tipo} className={erros.prefixo ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {DEMO_DATA.viaturas.filter(v => !vtrForm.tipo || v.tipo === vtrForm.tipo).map(v => (
                      <option key={v.id} value={v.prefixo} disabled={v.status === 'Em Serviço'}>
                        {v.prefixo} — {v.placa} {v.status === 'Em Serviço' ? '(Em serviço)' : ''}
                      </option>
                    ))}
                  </select>
                  {erros.prefixo && <div className="error-msg">{erros.prefixo}</div>}
                </div>
              </div>
              {vtrForm.placa && (
                <div className="alert alert-success" style={{ marginBottom: 12 }}>
                  VTR selecionada: <strong>{vtrForm.prefixo}</strong> · Placa: <strong>{vtrForm.placa}</strong>
                </div>
              )}
              <div className="form-group">
                <label>KM Atual (Hodômetro) <span className="required-star">*</span></label>
                <input type="number" placeholder="Ex: 45200" value={kmAtual}
                  onChange={e => setKmAtual(e.target.value)} className={erros.km ? 'input-error' : ''} />
                {erros.km && <div className="error-msg">{erros.km}</div>}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Voltar</button>
                <button className="btn btn-primary btn-lg" onClick={() => validateStep2() && setStep(3)}>Próximo: Checklist →</button>
              </div>
            </div>
          )}

          {/* STEP 3: CHECKLIST */}
          {step === 3 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">✅ Checklist da Viatura</span>
                <span className="badge badge-gray">{vtrForm.tipo}</span>
              </div>
              {Object.entries(checklistTemplate).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--verde-accent)', letterSpacing: 2, marginBottom: 8 }}>{cat}</div>
                  {items.map(item => (
                    <Checkbox key={item} label={item} checked={!!checklist[item]} onChange={v => setChecklist(p => ({ ...p, [item]: v }))} />
                  ))}
                </div>
              ))}

              <div className="divider" />
              <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📸 Fotos Obrigatórias</div>
              <div className="file-preview">
                {FOTOS_OBRIGATORIAS.map(f => (
                  <div key={f} className="file-thumb" style={{ cursor: 'pointer', flexDirection: 'column', gap: 4, border: fotosSimuladas[f] ? '1px solid var(--verde-accent)' : '1px solid var(--borda)' }}
                    onClick={() => setFotosSimuladas(p => ({ ...p, [f]: !p[f] }))}>
                    {fotosSimuladas[f] ? <span style={{ fontSize: 20, color: 'var(--verde-accent)' }}>✓</span> : <span style={{ fontSize: 18 }}>📷</span>}
                    <span style={{ fontSize: 8, color: fotosSimuladas[f] ? 'var(--verde-accent)' : 'var(--texto-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <div className="form-hint" style={{ marginTop: 8 }}>Clique no ícone para simular a captura da foto. Em produção, use a câmera do dispositivo.</div>

              <div className="divider" />
              <div className="checklist-item">
                <div className={`checkbox-custom ${declaracao ? 'checked' : ''}`} onClick={() => setDeclaracao(p => !p)}>
                  {declaracao && '✓'}
                </div>
                <span style={{ fontSize: 12 }} onClick={() => setDeclaracao(p => !p)}>
                  Declaro que vistoriei a viatura <strong>{vtrForm.prefixo}</strong>, conferindo todos os itens acima, e assumo a responsabilidade pelo seu uso durante o serviço.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)}>← Voltar</button>
                <button className="btn btn-primary btn-lg" onClick={() => validateStep3() && finalizarEntrada()}>✅ CONFIRMAR ENTRADA</button>
              </div>
            </div>
          )}

          {/* MODAL CONFLITO */}
          {conflito && (
            <ConfirmModal
              title="⚠ Conflito de Equipe"
              msg={`${conflito.pm.posto} ${conflito.pm.nome} (${conflito.pm.matricula}) já está em serviço na VTR ${conflito.servico.vtr?.prefixo} / ÁREA ${conflito.servico.area}. Deseja remanejá-lo(a) para esta equipe? A ação será registrada em auditoria.`}
              onConfirm={confirmarRemanejamento}
              onCancel={() => setConflito(null)}
              btnLabel="Remajenar com Auditoria"
              danger={true}
            />
          )}
        </div>
      );
    };

    // ─── TELA: EQUIPES EM SERVIÇO ────────────────────────────────────────────
    const EquipesServico = () => {
      const { user } = useContext(AppContext);
      const toast = useContext(ToastContext);
      const [servicosAtivos, setServicosAtivos] = useState(DEMO_DATA.servicos.filter(s => s.status === 'Ativo'));
      const [baixaModal, setBaixaModal] = useState(null);
      const [motivoBaixa, setMotivoBaixa] = useState('');
      const canBaixar = hasPermission(user, 'fiscal_policiamento');

      const [, forceUpdate] = useState(0);
      useEffect(() => {
        const interval = setInterval(() => {
          setServicosAtivos([...DEMO_DATA.servicos.filter(s => s.status === 'Ativo')]);
        }, 5000);
        return () => clearInterval(interval);
      }, []);

      const handleBaixa = () => {
        if (!motivoBaixa.trim()) { toast('Informe o motivo da baixa', 'error'); return; }
        const s = baixaModal;
        const idx = DEMO_DATA.servicos.findIndex(sv => sv.id === s.id);
        if (idx !== -1) {
          DEMO_DATA.servicos[idx].status = 'Baixado';
          DEMO_DATA.servicos[idx].motivoBaixa = motivoBaixa;
          DEMO_DATA.servicos[idx].dataBaixa = new Date().toISOString();
          DEMO_DATA.servicos[idx].baixadoPor = { id: user.id, nome: user.nome, posto: user.posto, matricula: user.matricula, perfil: user.perfil };
        }
        // Libera VTR
        const vIdx = DEMO_DATA.viaturas.findIndex(v => v.prefixo === s.vtr?.prefixo);
        if (vIdx !== -1) DEMO_DATA.viaturas[vIdx].status = 'Disponível';
        // AUDITORIA
        DEMO_DATA.logs.unshift({
          id: genId(), tipo: 'BAIXA',
          ator: `${user.posto} ${user.nome} (${user.matricula})`,
          acao: `Baixa de equipe – VTR ${s.vtr?.prefixo} / ÁREA ${s.area} – Motivo: ${motivoBaixa} – ${s.membros?.length || 0} membro(s)`,
          ts: new Date().toISOString()
        });
        s.membros?.forEach(m => {
          DEMO_DATA.logs.unshift({
            id: genId(), tipo: 'BAIXA_MEMBRO',
            ator: `${user.posto} ${user.nome} (${user.matricula})`,
            acao: `${m.posto} ${m.nome} (${m.matricula}) dispensado(a) do serviço – VTR ${s.vtr?.prefixo}`,
            ts: new Date().toISOString()
          });
        });
        toast(`Equipe VTR ${s.vtr?.prefixo} baixada com sucesso`, 'success');
        setBaixaModal(null); setMotivoBaixa('');
        setServicosAtivos([...DEMO_DATA.servicos.filter(sv => sv.status === 'Ativo')]);
      };

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Operacional</div>
              <div className="section-title" style={{ marginTop: 6 }}>Equipes em Serviço</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="status-online"><div className="status-dot" />TEMPO REAL</div>
              <span className="badge badge-green">{servicosAtivos.length} ativas</span>
            </div>
          </div>

          {servicosAtivos.length === 0 ? (
            <EmptyState icon="🚓" text="Nenhuma equipe em serviço no momento" />
          ) : (
            <div className="grid-2">
              {servicosAtivos.map(s => (
                <div key={s.id} className="card" style={{ borderLeft: '3px solid var(--verde-accent)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 24 }}>{s.vtr?.tipo === 'MOTO' ? '🏍️' : '🚓'}</span>
                      <div>
                        <div className="font-cond" style={{ fontWeight: 700, fontSize: 18, color: 'var(--verde-accent)' }}>{s.vtr?.prefixo || 'SEM VTR'}</div>
                        <div className="text-xs text-muted">{s.vtr?.modelo}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="badge badge-blue">{s.turno}</span>
                      <span className="badge badge-green">ATIVO</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--texto-muted)', marginBottom: 8 }}>
                    <span style={{ color: 'var(--texto)', fontWeight: 500 }}>{s.modalidade}</span> · {s.area} · {s.opm}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--texto-muted)', marginBottom: 10 }}>
                    INÍCIO: {fmtTime(s.dataInicio)} · {fmtDate(s.dataInicio)}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    {s.membros?.map(m => (
                      <div key={m.id} className="member-chip">
                        <span className="member-rank">{m.posto}</span>
                        <span className="member-name">{m.nome}</span>
                        <span className="font-mono text-xs text-muted">{m.matricula}</span>
                      </div>
                    ))}
                  </div>
                  {canBaixar && (
                    <button className="btn btn-danger w-full" onClick={() => setBaixaModal(s)}>
                      ⬇ Baixar Equipe
                    </button>
                  )}
                  {!canBaixar && <div className="text-xs text-muted text-center">Somente fiscal e superiores podem baixar</div>}
                </div>
              ))}
            </div>
          )}

          {baixaModal && (
            <Modal title="⬇ Baixar Equipe" onClose={() => { setBaixaModal(null); setMotivoBaixa(''); }}
              footer={<>
                <button className="btn btn-secondary" onClick={() => { setBaixaModal(null); setMotivoBaixa(''); }}>Cancelar</button>
                <button className="btn btn-danger" onClick={handleBaixa}>Confirmar Baixa</button>
              </>}>
              <div className="alert alert-warning" style={{ marginBottom: 14 }}>
                Você está baixando a equipe VTR <strong>{baixaModal.vtr?.prefixo}</strong> com <strong>{baixaModal.membros?.length}</strong> membro(s). Esta ação será registrada em auditoria.
              </div>
              <div className="form-group">
                <label>Motivo da Baixa <span className="required-star">*</span></label>
                <textarea placeholder="Descreva o motivo da baixa..." value={motivoBaixa}
                  onChange={e => setMotivoBaixa(e.target.value)} rows={3} />
              </div>
            </Modal>
          )}
        </div>
      );
    };

    // ─── TELA: ROP (OCORRÊNCIAS) ─────────────────────────────────────────────
    const RegistroOcorrencias = () => {
      const { user } = useContext(AppContext);
      const toast = useContext(ToastContext);
      const [form, setForm] = useState({ natureza: '', procedimento: '', descricao: '', servico_id: '', endereco: '', horaOcorrencia: '' });
      const [erros, setErros] = useState({});
      const [modal, setModal] = useState(false);
      const [tab, setTab] = useState('lista');

      const servicosDisponiveis = DEMO_DATA.servicos.filter(s => s.status === 'Ativo' &&
        s.membros?.find(m => m.id === user.id || hasPermission(user, 'fiscal_policiamento')));

      const validate = () => {
        const e = {};
        if (!form.natureza) e.natureza = 'Natureza é obrigatória';
        if (!form.procedimento) e.procedimento = 'Procedimento é obrigatório';
        if (!form.descricao) e.descricao = 'Descrição é obrigatória';
        setErros(e); return Object.keys(e).length === 0;
      };

      const salvar = () => {
        if (!validate()) return;
        const servico = DEMO_DATA.servicos.find(s => s.id === form.servico_id);
        const nova = {
          id: genId(),
          ...form,
          registradoPor: { id: user.id, nome: user.nome, posto: user.posto, matricula: user.matricula },
          vtr: servico?.vtr, area: servico?.area,
          status: 'Registrada',
          dataHora: new Date().toISOString()
        };
        DEMO_DATA.ocorrencias.unshift(nova);
        DEMO_DATA.logs.unshift({
          id: genId(), tipo: 'ROP',
          ator: `${user.posto} ${user.nome} (${user.matricula})`,
          acao: `ROP registrada – Natureza: ${form.natureza} – Proc: ${form.procedimento}${servico ? ' – VTR ' + servico.vtr?.prefixo : ''}`,
          ts: new Date().toISOString()
        });
        toast('Ocorrência registrada com sucesso!', 'success');
        setForm({ natureza: '', procedimento: '', descricao: '', servico_id: '', endereco: '', horaOcorrencia: '' });
        setModal(false); setTab('lista');
      };

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Registro</div>
              <div className="section-title" style={{ marginTop: 6 }}>ROP – Registro de Ocorrências</div>
            </div>
            <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nova ROP</button>
          </div>

          <div className="tabs">
            <div className={`tab ${tab === 'lista' ? 'active' : ''}`} onClick={() => setTab('lista')}>Ocorrências</div>
            <div className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Estatísticas</div>
          </div>

          {tab === 'lista' && (
            DEMO_DATA.ocorrencias.length === 0 ? <EmptyState icon="📋" text="Nenhuma ocorrência registrada" /> : (
              <div>
                {DEMO_DATA.ocorrencias.map(o => (
                  <div key={o.id} className="card" style={{ marginBottom: 10, borderLeft: '3px solid var(--borda-forte)' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <div className="flex gap-2 items-center">
                        <span style={{ color: 'var(--verde-accent)', fontSize: 16 }}>📋</span>
                        <span className="font-cond" style={{ fontWeight: 700, fontSize: 16 }}>{o.natureza}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="badge badge-blue">{o.procedimento}</span>
                        <span className="badge badge-green">{o.status}</span>
                      </div>
                    </div>
                    {o.endereco && <div style={{ fontSize: 12, color: 'var(--texto-muted)', marginBottom: 4 }}>📍 {o.endereco}</div>}
                    <div style={{ fontSize: 13, marginBottom: 8 }}>{o.descricao}</div>
                    {o.vtr && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--texto-muted)' }}>
                      VTR: {o.vtr.prefixo} · {o.area && `ÁREA: ${o.area}`}
                    </div>}
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--texto-muted)', marginTop: 4 }}>
                      {fmtDateTime(o.dataHora)} · {o.registradoPor?.posto} {o.registradoPor?.nome}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'stats' && (
            <div>
              <div className="stat-grid" style={{ marginBottom: 16 }}>
                <div className="stat-card"><div className="stat-number">{DEMO_DATA.ocorrencias.length}</div><div className="stat-label">Total</div></div>
                <div className="stat-card"><div className="stat-number">{DEMO_DATA.ocorrencias.filter(o=>o.procedimento==='APF').length}</div><div className="stat-label">APF</div></div>
                <div className="stat-card"><div className="stat-number">{DEMO_DATA.ocorrencias.filter(o=>o.procedimento==='BO').length}</div><div className="stat-label">BO</div></div>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Por Natureza</div>
                {Object.entries(DEMO_DATA.ocorrencias.reduce((acc, o) => { acc[o.natureza] = (acc[o.natureza] || 0) + 1; return acc; }, {})).sort((a,b)=>b[1]-a[1]).map(([nat, qtd]) => (
                  <div key={nat} style={{ marginBottom: 8 }}>
                    <div className="flex justify-between text-sm" style={{ marginBottom: 3 }}>
                      <span>{nat}</span><span className="font-mono text-accent">{qtd}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${(qtd/DEMO_DATA.ocorrencias.length)*100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {modal && (
            <Modal title="📋 Nova Ocorrência (ROP)" onClose={() => setModal(false)} size="lg"
              footer={<>
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={salvar}>Registrar Ocorrência</button>
              </>}>
              <div className="form-group">
                <label>Natureza da Ocorrência <span className="required-star">*</span></label>
                <select value={form.natureza} onChange={e => setForm(p => ({ ...p, natureza: e.target.value }))} className={erros.natureza ? 'input-error' : ''} style={{ fontSize: 14 }}>
                  <option value="">— Selecione a Natureza —</option>
                  {NATUREZAS_OCORRENCIA.map(n => <option key={n}>{n}</option>)}
                </select>
                {erros.natureza && <div className="error-msg">{erros.natureza}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Procedimento <span className="required-star">*</span></label>
                  <select value={form.procedimento} onChange={e => setForm(p => ({ ...p, procedimento: e.target.value }))} className={erros.procedimento ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {PROCEDIMENTOS.map(p => <option key={p}>{p}</option>)}
                  </select>
                  {erros.procedimento && <div className="error-msg">{erros.procedimento}</div>}
                </div>
                <div className="form-group">
                  <label>Hora da Ocorrência</label>
                  <input type="time" value={form.horaOcorrencia} onChange={e => setForm(p => ({ ...p, horaOcorrencia: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Endereço / Local</label>
                <input type="text" placeholder="Rua, número, bairro..." value={form.endereco} onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Equipe / VTR</label>
                <select value={form.servico_id} onChange={e => setForm(p => ({ ...p, servico_id: e.target.value }))}>
                  <option value="">Selecione (opcional)</option>
                  {servicosDisponiveis.map(s => <option key={s.id} value={s.id}>{s.vtr?.prefixo} – {s.area}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Descrição dos Fatos <span className="required-star">*</span></label>
                <textarea placeholder="Descreva os fatos de forma completa e objetiva..." value={form.descricao}
                  onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={4} className={erros.descricao ? 'input-error' : ''} />
                {erros.descricao && <div className="error-msg">{erros.descricao}</div>}
              </div>
            </Modal>
          )}
        </div>
      );
    };

    // ─── TELA: ARMAMENTO / CAUTELA ───────────────────────────────────────────
    const GestaoArmamento = () => {
      const { user } = useContext(AppContext);
      const toast = useContext(ToastContext);
      const isArmeiro = user.perfil === 'armeiro' || hasPermission(user, 'oficial');
      const [tab, setTab] = useState('materiais');
      const [modalMaterial, setModalMaterial] = useState(false);
      const [modalCautela, setModalCautela] = useState(false);
      const [formMat, setFormMat] = useState({ nome: '', tipo: '', quantidade: 1, serie: 'MULTI' });
      const [formCaut, setFormCaut] = useState({ material_id: '', policial_id: '', quantidade: 1, observacao: '' });
      const [erros, setErros] = useState({});
      const [, forceUpdate] = useState(0);

      const aprovarEntrega = (cId) => {
        const idx = DEMO_DATA.cautelas.findIndex(c => c.id === cId);
        if (idx === -1) return;
        DEMO_DATA.cautelas[idx].status = 'Entregue';
        DEMO_DATA.cautelas[idx].armeiro = user.nome;
        DEMO_DATA.cautelas[idx].dataEntrega = new Date().toISOString();
        const mat = DEMO_DATA.materiais.find(m => m.nome === DEMO_DATA.cautelas[idx].material);
        if (mat) mat.disponiveis = Math.max(0, mat.disponiveis - (DEMO_DATA.cautelas[idx].quantidade || 1));
        DEMO_DATA.logs.unshift({
          id: genId(), tipo: 'CAUTELA',
          ator: `${user.posto} ${user.nome} (${user.matricula})`,
          acao: `Material ${DEMO_DATA.cautelas[idx].material} entregue para ${DEMO_DATA.cautelas[idx].posto} ${DEMO_DATA.cautelas[idx].policial} (${DEMO_DATA.cautelas[idx].matricula})`,
          ts: new Date().toISOString()
        });
        toast('Material entregue! Estoque atualizado.', 'success');
        forceUpdate(n => n+1);
      };

      const processarDevolucao = (cId) => {
        const idx = DEMO_DATA.cautelas.findIndex(c => c.id === cId);
        if (idx === -1) return;
        const mat = DEMO_DATA.materiais.find(m => m.nome === DEMO_DATA.cautelas[idx].material);
        if (mat) mat.disponiveis += (DEMO_DATA.cautelas[idx].quantidade || 1);
        DEMO_DATA.cautelas[idx].status = 'Devolvido';
        DEMO_DATA.cautelas[idx].dataDevolucao = new Date().toISOString();
        DEMO_DATA.logs.unshift({
          id: genId(), tipo: 'DEVOLUCAO',
          ator: `${user.posto} ${user.nome} (${user.matricula})`,
          acao: `Material ${DEMO_DATA.cautelas[idx].material} devolvido por ${DEMO_DATA.cautelas[idx].policial}. Estoque restituído.`,
          ts: new Date().toISOString()
        });
        toast('Devolução registrada e estoque restituído!', 'success');
        forceUpdate(n => n+1);
      };

      const salvarMaterial = () => {
        if (!formMat.nome || !formMat.tipo) { setErros({ nome: !formMat.nome ? 'Obrigatório' : '', tipo: !formMat.tipo ? 'Obrigatório' : '' }); return; }
        DEMO_DATA.materiais.push({ id: genId(), ...formMat, disponiveis: parseInt(formMat.quantidade), status: 'Ativo' });
        DEMO_DATA.logs.unshift({ id: genId(), tipo: 'MATERIAL', ator: `${user.posto} ${user.nome} (${user.matricula})`, acao: `Material cadastrado: ${formMat.nome} (${formMat.tipo}) – Qtd: ${formMat.quantidade}`, ts: new Date().toISOString() });
        toast('Material cadastrado!', 'success'); setModalMaterial(false); setFormMat({ nome: '', tipo: '', quantidade: 1, serie: 'MULTI' }); forceUpdate(n => n+1);
      };

      const solicitarCautela = () => {
        const mat = DEMO_DATA.materiais.find(m => m.id === formCaut.material_id);
        const pol = DEMO_DATA.users.find(u => u.id === formCaut.policial_id);
        if (!mat || !pol) { toast('Selecione material e policial', 'error'); return; }
        if (mat.disponiveis < formCaut.quantidade) { toast('Quantidade indisponível em estoque', 'error'); return; }
        DEMO_DATA.cautelas.unshift({
          id: genId(), material: mat.nome, material_id: mat.id,
          policial: pol.nome, policial_id: pol.id, posto: pol.posto, matricula: pol.matricula,
          quantidade: parseInt(formCaut.quantidade), observacao: formCaut.observacao,
          status: 'Aguardando', solicitadoPor: user.nome, dataSolicitacao: new Date().toISOString()
        });
        toast('Cautela solicitada! Aguarde aprovação do armeiro.', 'success');
        setModalCautela(false); setFormCaut({ material_id: '', policial_id: '', quantidade: 1, observacao: '' }); forceUpdate(n => n+1);
      };

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Armamento</div>
              <div className="section-title" style={{ marginTop: 6 }}>Reserva de Armamento e Material</div>
            </div>
            <div className="flex gap-2">
              {isArmeiro && <button className="btn btn-secondary btn-sm" onClick={() => setModalMaterial(true)}>+ Material</button>}
              <button className="btn btn-primary" onClick={() => setModalCautela(true)}>+ Cautela</button>
            </div>
          </div>

          <div className="tabs">
            <div className={`tab ${tab === 'materiais' ? 'active' : ''}`} onClick={() => setTab('materiais')}>Estoque</div>
            <div className={`tab ${tab === 'cautelas' ? 'active' : ''}`} onClick={() => setTab('cautelas')}>Cautelas</div>
          </div>

          {tab === 'materiais' && (
            <div>
              <div className="stat-grid" style={{ marginBottom: 16 }}>
                {TIPOS_MATERIAL.map(t => {
                  const count = DEMO_DATA.materiais.filter(m => m.tipo === t && m.status === 'Ativo').reduce((a, m) => a + m.disponiveis, 0);
                  return count > 0 ? <div key={t} className="stat-card"><div className="stat-number">{count}</div><div className="stat-label">{t}</div></div> : null;
                }).filter(Boolean)}
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Material</th><th>Tipo</th><th>Total</th><th>Disponíveis</th><th>Status</th></tr></thead>
                    <tbody>
                      {DEMO_DATA.materiais.map(m => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 500 }}>{m.nome}</td>
                          <td><span className="badge badge-gray">{m.tipo}</span></td>
                          <td className="font-mono">{m.quantidade}</td>
                          <td><span className={`font-mono ${m.disponiveis === 0 ? 'text-danger' : m.disponiveis < m.quantidade * 0.3 ? 'text-warning' : 'text-accent'}`}>{m.disponiveis}</span></td>
                          <td><span className={`badge ${m.status === 'Ativo' ? 'badge-green' : 'badge-red'}`}>{m.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'cautelas' && (
            <div>
              {DEMO_DATA.cautelas.length === 0 ? <EmptyState icon="🔫" text="Nenhuma cautela registrada" /> : (
                DEMO_DATA.cautelas.map(c => (
                  <div key={c.id} className="card" style={{ marginBottom: 10 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{c.material}</span>
                        <span className="font-mono text-xs text-muted" style={{ marginLeft: 8 }}>Qtd: {c.quantidade}</span>
                      </div>
                      <span className={`badge ${c.status === 'Aguardando' ? 'badge-yellow' : c.status === 'Entregue' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span>
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      <strong>{c.posto} {c.policial}</strong> <span className="font-mono text-xs text-muted">({c.matricula})</span>
                    </div>
                    {c.observacao && <div className="text-sm text-muted" style={{ marginBottom: 8 }}>{c.observacao}</div>}
                    <div className="font-mono text-xs text-muted">
                      Solicitado: {fmtDateTime(c.dataSolicitacao)}
                      {c.dataEntrega && ` · Entregue: ${fmtDateTime(c.dataEntrega)}`}
                    </div>
                    {isArmeiro && c.status === 'Aguardando' && (
                      <div className="flex gap-2" style={{ marginTop: 10 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => aprovarEntrega(c.id)}>✓ Aprovar e Entregar</button>
                      </div>
                    )}
                    {isArmeiro && c.status === 'Entregue' && (
                      <div className="flex gap-2" style={{ marginTop: 10 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => processarDevolucao(c.id)}>↩ Processar Devolução</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {modalMaterial && (
            <Modal title="+ Cadastrar Material" onClose={() => setModalMaterial(false)}
              footer={<><button className="btn btn-secondary" onClick={() => setModalMaterial(false)}>Cancelar</button><button className="btn btn-primary" onClick={salvarMaterial}>Salvar</button></>}>
              <div className="form-group">
                <label>Nome do Material <span className="required-star">*</span></label>
                <input type="text" value={formMat.nome} onChange={e => setFormMat(p => ({ ...p, nome: e.target.value }))} className={erros.nome ? 'input-error' : ''} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo <span className="required-star">*</span></label>
                  <select value={formMat.tipo} onChange={e => setFormMat(p => ({ ...p, tipo: e.target.value }))} className={erros.tipo ? 'input-error' : ''}>
                    <option value="">Selecione</option>
                    {TIPOS_MATERIAL.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantidade</label>
                  <input type="number" min="1" value={formMat.quantidade} onChange={e => setFormMat(p => ({ ...p, quantidade: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <div className="form-group">
                <label>Controle de Série</label>
                <select value={formMat.serie} onChange={e => setFormMat(p => ({ ...p, serie: e.target.value }))}>
                  <option value="MULTI">Por Quantidade (múltiplos)</option>
                  <option value="UNICO">Item Único (número de série)</option>
                </select>
              </div>
            </Modal>
          )}

          {modalCautela && (
            <Modal title="+ Solicitar Cautela" onClose={() => setModalCautela(false)}
              footer={<><button className="btn btn-secondary" onClick={() => setModalCautela(false)}>Cancelar</button><button className="btn btn-primary" onClick={solicitarCautela}>Solicitar</button></>}>
              <div className="form-group">
                <label>Material <span className="required-star">*</span></label>
                <select value={formCaut.material_id} onChange={e => setFormCaut(p => ({ ...p, material_id: e.target.value }))}>
                  <option value="">Selecione o material</option>
                  {DEMO_DATA.materiais.filter(m => m.status === 'Ativo' && m.disponiveis > 0).map(m => (
                    <option key={m.id} value={m.id}>{m.nome} (disponíveis: {m.disponiveis})</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Policial <span className="required-star">*</span></label>
                  <select value={formCaut.policial_id} onChange={e => setFormCaut(p => ({ ...p, policial_id: e.target.value }))}>
                    <option value="">Selecione</option>
                    {DEMO_DATA.users.filter(u => u.status === 'Ativo').map(u => (
                      <option key={u.id} value={u.id}>{u.posto} {u.nome} ({u.matricula})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantidade</label>
                  <input type="number" min="1" value={formCaut.quantidade} onChange={e => setFormCaut(p => ({ ...p, quantidade: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Observação</label>
                <textarea value={formCaut.observacao} onChange={e => setFormCaut(p => ({ ...p, observacao: e.target.value }))} rows={2} />
              </div>
            </Modal>
          )}
        </div>
      );
    };

    // ─── TELA: AUDITORIA ─────────────────────────────────────────────────────
    const Auditoria = () => {
      const [filtroTipo, setFiltroTipo] = useState('');
      const [busca, setBusca] = useState('');
      const tiposUnicos = [...new Set(DEMO_DATA.logs.map(l => l.tipo))];
      const logsFiltrados = DEMO_DATA.logs.filter(l =>
        (!filtroTipo || l.tipo === filtroTipo) &&
        (!busca || l.acao.toLowerCase().includes(busca.toLowerCase()) || l.ator.toLowerCase().includes(busca.toLowerCase()))
      );

      const badgeTipo = (tipo) => {
        const m = { LOGIN: 'badge-blue', LOGOUT: 'badge-gray', ENTRADA: 'badge-green', BAIXA: 'badge-red', REMANEJAMENTO: 'badge-yellow', CAUTELA: 'badge-blue', DEVOLUCAO: 'badge-gray', ROP: 'badge-green', MATERIAL: 'badge-blue' };
        return m[tipo] || 'badge-gray';
      };

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Conformidade</div>
              <div className="section-title" style={{ marginTop: 6 }}>Auditoria do Sistema</div>
            </div>
            <span className="badge badge-green">{DEMO_DATA.logs.length} registros</span>
          </div>

          <div className="flex gap-3" style={{ marginBottom: 16 }}>
            <div className="search-wrap" style={{ flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input type="text" className="search-input" placeholder="Buscar em auditoria..." value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ width: 160 }}>
              <option value="">Todos os tipos</option>
              {tiposUnicos.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {logsFiltrados.length === 0 ? <EmptyState icon="📜" text="Nenhum log encontrado" /> : (
            logsFiltrados.map(l => (
              <div key={l.id} className="audit-entry">
                <div className="flex items-center gap-2">
                  <span className={`badge ${badgeTipo(l.tipo)}`}>{l.tipo}</span>
                  <span className="audit-timestamp">{fmtDateTime(l.ts)}</span>
                </div>
                <div className="audit-action" style={{ marginTop: 6 }}>{l.acao}</div>
                <div className="audit-actor" style={{ marginTop: 4 }}>Por: {l.ator}</div>
              </div>
            ))
          )}
        </div>
      );
    };

    // ─── TELA: USUÁRIOS ──────────────────────────────────────────────────────
    const GestaoUsuarios = () => {
      const { user } = useContext(AppContext);
      const toast = useContext(ToastContext);
      const [modal, setModal] = useState(false);
      const [editUser, setEditUser] = useState(null);
      const [form, setForm] = useState({ matricula: '', nome: '', posto: '', perfil: 'operacional', opm: '', status: 'Pendente', senha: '' });
      const [, forceUpdate] = useState(0);

      const salvar = () => {
        if (!form.matricula || !form.nome || !form.posto) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
        if (editUser) {
          const idx = DEMO_DATA.users.findIndex(u => u.id === editUser.id);
          if (idx !== -1) DEMO_DATA.users[idx] = { ...DEMO_DATA.users[idx], ...form };
          DEMO_DATA.logs.unshift({ id: genId(), tipo: 'ADM', ator: `${user.posto} ${user.nome} (${user.matricula})`, acao: `Usuário atualizado: ${form.nome} (${form.matricula}) – Perfil: ${PERFIS_LABELS[form.perfil]}`, ts: new Date().toISOString() });
          toast('Usuário atualizado!', 'success');
        } else {
          if (DEMO_DATA.users.find(u => u.matricula === form.matricula)) { toast('Matrícula já cadastrada', 'error'); return; }
          DEMO_DATA.users.push({ id: genId(), ...form });
          DEMO_DATA.logs.unshift({ id: genId(), tipo: 'CADASTRO', ator: `${user.posto} ${user.nome} (${user.matricula})`, acao: `Novo usuário cadastrado: ${form.nome} (${form.matricula}) – Perfil: ${PERFIS_LABELS[form.perfil]}`, ts: new Date().toISOString() });
          toast('Usuário cadastrado!', 'success');
        }
        setModal(false); setEditUser(null); setForm({ matricula: '', nome: '', posto: '', perfil: 'operacional', opm: '', status: 'Pendente', senha: '' });
        forceUpdate(n => n+1);
      };

      const toggleStatus = (uid) => {
        const idx = DEMO_DATA.users.findIndex(u => u.id === uid);
        if (idx === -1) return;
        const novo = DEMO_DATA.users[idx].status === 'Ativo' ? 'Inativo' : 'Ativo';
        DEMO_DATA.users[idx].status = novo;
        DEMO_DATA.logs.unshift({ id: genId(), tipo: 'ADM', ator: `${user.posto} ${user.nome} (${user.matricula})`, acao: `Status de ${DEMO_DATA.users[idx].nome} alterado para ${novo}`, ts: new Date().toISOString() });
        toast(`Usuário ${novo === 'Ativo' ? 'ativado' : 'inativado'}`, 'success');
        forceUpdate(n => n+1);
      };

      const openEdit = (u) => {
        setEditUser(u); setForm({ matricula: u.matricula, nome: u.nome, posto: u.posto, perfil: u.perfil, opm: u.opm, status: u.status, senha: '' });
        setModal(true);
      };

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Administração</div>
              <div className="section-title" style={{ marginTop: 6 }}>Gestão de Usuários</div>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditUser(null); setForm({ matricula: '', nome: '', posto: '', perfil: 'operacional', opm: '', status: 'Pendente', senha: '' }); setModal(true); }}>+ Novo Usuário</button>
          </div>

          <div className="stat-grid" style={{ marginBottom: 16 }}>
            {[['Ativo','badge-green'],['Pendente','badge-yellow'],['Inativo','badge-red']].map(([s, b]) => (
              <div key={s} className="stat-card">
                <div className="stat-number">{DEMO_DATA.users.filter(u => u.status === s).length}</div>
                <div className="stat-label">{s}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Matrícula</th><th>Nome</th><th>Posto</th><th>OPM</th><th>Perfil</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {DEMO_DATA.users.map(u => (
                    <tr key={u.id}>
                      <td className="font-mono text-accent">{u.matricula}</td>
                      <td style={{ fontWeight: 500 }}>{u.nome}</td>
                      <td><span className="badge badge-gray">{u.posto}</span></td>
                      <td>{u.opm}</td>
                      <td><span className="badge badge-blue">{PERFIS_LABELS[u.perfil] || u.perfil}</span></td>
                      <td><span className={`badge ${u.status === 'Ativo' ? 'badge-green' : u.status === 'Pendente' ? 'badge-yellow' : 'badge-red'}`}>{u.status}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>Editar</button>
                          {u.id !== user.id && <button className={`btn btn-sm ${u.status === 'Ativo' ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleStatus(u.id)}>{u.status === 'Ativo' ? 'Inativar' : 'Ativar'}</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {modal && (
            <Modal title={editUser ? 'Editar Usuário' : '+ Novo Usuário'} onClose={() => { setModal(false); setEditUser(null); }}
              footer={<><button className="btn btn-secondary" onClick={() => { setModal(false); setEditUser(null); }}>Cancelar</button><button className="btn btn-primary" onClick={salvar}>Salvar</button></>}>
              <div className="form-row">
                <div className="form-group">
                  <label>Matrícula <span className="required-star">*</span></label>
                  <input type="text" value={form.matricula} onChange={e => setForm(p => ({ ...p, matricula: e.target.value }))} disabled={!!editUser} />
                </div>
                <div className="form-group">
                  <label>Senha {!editUser && <span className="required-star">*</span>}</label>
                  <input type="password" value={form.senha} onChange={e => setForm(p => ({ ...p, senha: e.target.value }))} placeholder={editUser ? 'Deixe em branco para manter' : ''} />
                </div>
              </div>
              <div className="form-group">
                <label>Nome Completo <span className="required-star">*</span></label>
                <input type="text" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Posto/Graduação <span className="required-star">*</span></label>
                  <select value={form.posto} onChange={e => setForm(p => ({ ...p, posto: e.target.value }))}>
                    <option value="">Selecione</option>
                    {POSTOS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>OPM</label>
                  <select value={form.opm} onChange={e => setForm(p => ({ ...p, opm: e.target.value }))}>
                    <option value="">Selecione</option>
                    {OPMS.filter(o => o !== 'OUTRA').map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Perfil</label>
                  <select value={form.perfil} onChange={e => setForm(p => ({ ...p, perfil: e.target.value }))}>
                    {Object.entries(PERFIS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {['Ativo', 'Pendente', 'Inativo'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </Modal>
          )}
        </div>
      );
    };

    // ─── TELA: HISTÓRICO ─────────────────────────────────────────────────────
    const Historico = () => {
      const servicosEncerrados = DEMO_DATA.servicos.filter(s => s.status !== 'Ativo');
      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Histórico</div>
              <div className="section-title" style={{ marginTop: 6 }}>Histórico Geral</div>
            </div>
            <span className="badge badge-gray">{servicosEncerrados.length} serviços</span>
          </div>
          {servicosEncerrados.length === 0 ? <EmptyState icon="📂" text="Nenhum histórico disponível" /> : (
            servicosEncerrados.map(s => (
              <div key={s.id} className="card" style={{ marginBottom: 10, opacity: 0.85 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 20 }}>{s.vtr?.tipo === 'MOTO' ? '🏍️' : '🚓'}</span>
                    <div>
                      <div className="font-cond" style={{ fontWeight: 700, fontSize: 16 }}>{s.vtr?.prefixo || 'SEM VTR'}</div>
                      <div className="text-xs text-muted">{s.modalidade} · {s.area}</div>
                    </div>
                  </div>
                  <span className="badge badge-gray">BAIXADO</span>
                </div>
                <div className="font-mono text-xs text-muted">
                  Início: {fmtDateTime(s.dataInicio)}
                  {s.dataBaixa && ` · Baixa: ${fmtDateTime(s.dataBaixa)}`}
                </div>
                {s.motivoBaixa && <div className="text-sm text-muted" style={{ marginTop: 6 }}>Motivo: {s.motivoBaixa}</div>}
                {s.baixadoPor && <div className="font-mono text-xs text-muted" style={{ marginTop: 4 }}>Baixado por: {s.baixadoPor.posto} {s.baixadoPor.nome} ({s.baixadoPor.matricula})</div>}
                <div style={{ marginTop: 8 }}>
                  {s.membros?.map(m => <span key={m.id} className="badge badge-gray" style={{ marginRight: 4, marginBottom: 4 }}>{m.posto} {m.nome}</span>)}
                </div>
              </div>
            ))
          )}
        </div>
      );
    };

    // ─── TELA: PAINEL DEV ─────────────────────────────────────────────────────
    const PainelDev = () => {
      const toast = useContext(ToastContext);
      const perfis = Object.keys(PERFIS_LABELS);
      const telas = ['Dashboard', 'Entrada de Serviço', 'Equipes em Serviço', 'ROP', 'Armamento', 'Auditoria', 'Histórico', 'Usuários', 'Viaturas'];
      const [permissoes, setPermissoes] = useState(() => {
        const p = {};
        telas.forEach(t => { p[t] = {}; perfis.forEach(pf => { p[t][pf] = PERFIL_WEIGHT[pf] >= 1; }); });
        return p;
      });

      const toggle = (tela, perfil) => {
        setPermissoes(prev => ({ ...prev, [tela]: { ...prev[tela], [perfil]: !prev[tela][perfil] } }));
      };

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Desenvolvedor</div>
              <div className="section-title" style={{ marginTop: 6 }}>Painel do Desenvolvedor</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => toast('Configurações salvas no Firestore!', 'success')}>Salvar Configurações</button>
          </div>
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            ⚠ Área restrita. Alterações aqui afetam diretamente o controle de acesso de todos os usuários do sistema.
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Matriz de Permissões por Perfil</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 160 }}>Tela</th>
                    {perfis.map(p => <th key={p} style={{ textAlign: 'center', fontSize: 10, whiteSpace: 'normal', maxWidth: 80 }}>{PERFIS_LABELS[p]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {telas.map(tela => (
                    <tr key={tela}>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{tela}</td>
                      {perfis.map(pf => (
                        <td key={pf} style={{ textAlign: 'center', padding: '8px 4px' }}>
                          <label className="switch">
                            <input type="checkbox" checked={!!permissoes[tela]?.[pf]} onChange={() => toggle(tela, pf)} />
                            <span className="slider" />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Informações do Sistema</div>
            <div className="form-row">
              {[
                ['Versão', '1.0.0-SISOP'],
                ['Ambiente', IS_DEMO ? 'DEMO / LOCAL' : 'PRODUÇÃO'],
                ['Banco', IS_DEMO ? 'Memória (Demo)' : 'Firestore'],
                ['Usuários', DEMO_DATA.users.length],
                ['Logs', DEMO_DATA.logs.length],
                ['Serviços', DEMO_DATA.servicos.length],
              ].map(([k, v]) => (
                <div key={k} className="stat-card">
                  <div className="stat-number" style={{ fontSize: 18 }}>{v}</div>
                  <div className="stat-label">{k}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Instruções de Deploy</div>
            <div className="alert alert-info" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              1. Criar projeto Firebase console.firebase.google.com<br/>
              2. Habilitar Authentication (Email/Senha)<br/>
              3. Criar Firestore Database<br/>
              4. Substituir firebaseConfig no topo do arquivo<br/>
              5. Definir IS_DEMO = false<br/>
              6. Configurar regras Firestore (ver README)<br/>
              7. Deploy: firebase deploy ou Netlify/Vercel
            </div>
          </div>
        </div>
      );
    };

    // ─── TELA: VIATURAS ──────────────────────────────────────────────────────
    const GestaoViaturas = () => {
      const { user } = useContext(AppContext);
      const toast = useContext(ToastContext);
      const [modal, setModal] = useState(false);
      const [editVtr, setEditVtr] = useState(null);
      const [form, setForm] = useState({ tipo: 'CARRO', modelo: '', prefixo: '', placa: '', km: '' });
      const [, forceUpdate] = useState(0);

      const salvar = () => {
        if (!form.modelo || !form.prefixo || !form.placa) { toast('Preencha todos os campos', 'error'); return; }
        if (editVtr) {
          const idx = DEMO_DATA.viaturas.findIndex(v => v.id === editVtr.id);
          if (idx !== -1) DEMO_DATA.viaturas[idx] = { ...DEMO_DATA.viaturas[idx], ...form, km: parseInt(form.km) || 0 };
          toast('Viatura atualizada!', 'success');
        } else {
          DEMO_DATA.viaturas.push({ id: genId(), ...form, km: parseInt(form.km) || 0, status: 'Disponível' });
          toast('Viatura cadastrada!', 'success');
        }
        DEMO_DATA.logs.unshift({ id: genId(), tipo: 'VTR', ator: `${user.posto} ${user.nome} (${user.matricula})`, acao: `${editVtr ? 'Viatura atualizada' : 'Viatura cadastrada'}: ${form.prefixo} – ${form.modelo} – ${form.placa}`, ts: new Date().toISOString() });
        setModal(false); setEditVtr(null); setForm({ tipo: 'CARRO', modelo: '', prefixo: '', placa: '', km: '' }); forceUpdate(n => n+1);
      };

      const openEdit = (v) => { setEditVtr(v); setForm({ tipo: v.tipo, modelo: v.modelo, prefixo: v.prefixo, placa: v.placa, km: String(v.km) }); setModal(true); };

      return (
        <div>
          <div className="section-header">
            <div>
              <div className="page-tag">Frota</div>
              <div className="section-title" style={{ marginTop: 6 }}>Gestão de Viaturas</div>
            </div>
            {hasPermission(user, 'administrativo') && <button className="btn btn-primary" onClick={() => { setEditVtr(null); setForm({ tipo: 'CARRO', modelo: '', prefixo: '', placa: '', km: '' }); setModal(true); }}>+ Nova VTR</button>}
          </div>
          <div className="stat-grid" style={{ marginBottom: 16 }}>
            {['Disponível', 'Em Serviço', 'Manutenção'].map(s => (
              <div key={s} className="stat-card">
                <div className="stat-number">{DEMO_DATA.viaturas.filter(v => v.status === s).length}</div>
                <div className="stat-label">{s}</div>
              </div>
            ))}
          </div>
          <div className="grid-2">
            {DEMO_DATA.viaturas.map(v => (
              <div key={v.id} className="card">
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 28 }}>{v.tipo === 'MOTO' ? '🏍️' : '🚗'}</span>
                    <div>
                      <div className="font-cond" style={{ fontWeight: 700, fontSize: 16, color: 'var(--verde-accent)' }}>{v.prefixo}</div>
                      <div className="text-xs text-muted">{v.tipo}</div>
                    </div>
                  </div>
                  <span className={`badge ${v.status === 'Disponível' ? 'badge-green' : v.status === 'Em Serviço' ? 'badge-yellow' : 'badge-red'}`}>{v.status}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{v.modelo}</div>
                <div className="font-mono text-xs text-muted">PLACA: {v.placa} · KM: {v.km?.toLocaleString()}</div>
                {hasPermission(user, 'administrativo') && (
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => openEdit(v)}>Editar</button>
                )}
              </div>
            ))}
          </div>
          {modal && (
            <Modal title={editVtr ? 'Editar Viatura' : '+ Cadastrar Viatura'} onClose={() => { setModal(false); setEditVtr(null); }}
              footer={<><button className="btn btn-secondary" onClick={() => { setModal(false); setEditVtr(null); }}>Cancelar</button><button className="btn btn-primary" onClick={salvar}>Salvar</button></>}>
              <div className="form-group">
                <label>Tipo</label>
                <div className="vtr-type-grid" style={{ marginTop: 6 }}>
                  {[{ tipo: 'CARRO', icon: '🚗' }, { tipo: 'MOTO', icon: '🏍️' }].map(({ tipo, icon }) => (
                    <div key={tipo} className={`vtr-type-card ${form.tipo === tipo ? 'selected' : ''}`} onClick={() => setForm(p => ({ ...p, tipo, modelo: '' }))}>
                      <div className="vtr-type-icon">{icon}</div><div className="vtr-type-label">{tipo}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Modelo <span className="required-star">*</span></label>
                <select value={form.modelo} onChange={e => setForm(p => ({ ...p, modelo: e.target.value }))}>
                  <option value="">Selecione</option>
                  {(form.tipo === 'MOTO' ? MODELOS_MOTO : MODELOS_CARRO).map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prefixo <span className="required-star">*</span></label>
                  <input type="text" value={form.prefixo} onChange={e => setForm(p => ({ ...p, prefixo: e.target.value }))} placeholder="Ex: BPM-05" />
                </div>
                <div className="form-group">
                  <label>Placa <span className="required-star">*</span></label>
                  <input type="text" value={form.placa} onChange={e => setForm(p => ({ ...p, placa: e.target.value }))} placeholder="Ex: ABC-1234" />
                </div>
              </div>
              <div className="form-group">
                <label>KM Atual</label>
                <input type="number" value={form.km} onChange={e => setForm(p => ({ ...p, km: e.target.value }))} placeholder="0" />
              </div>
            </Modal>
          )}
        </div>
      );
    };

    // ─── APP PRINCIPAL ────────────────────────────────────────────────────────
    const App = () => {
      const [currentUser, setCurrentUser] = useState(null);
      const [activePage, setActivePage] = useState('dashboard');
      const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
      const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
      const [inactiveWarning, setInactiveWarning] = useState(false);
      const toast = useContext(ToastContext);
      const lastActivityRef = useRef(Date.now());
      const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 min

      // Logout automático por inatividade
      useEffect(() => {
        if (!currentUser) return;
        const resetActivity = () => { lastActivityRef.current = Date.now(); setInactiveWarning(false); };
        window.addEventListener('mousemove', resetActivity);
        window.addEventListener('keydown', resetActivity);
        window.addEventListener('touchstart', resetActivity);
        const check = setInterval(() => {
          const idle = Date.now() - lastActivityRef.current;
          if (idle > INACTIVITY_LIMIT - 60000) setInactiveWarning(true);
          if (idle > INACTIVITY_LIMIT) {
            DEMO_DATA.logs.unshift({ id: genId(), tipo: 'LOGOUT', ator: `${currentUser.posto} ${currentUser.nome} (${currentUser.matricula})`, acao: 'Logout automático por inatividade (30 min)', ts: new Date().toISOString() });
            toast('Sessão encerrada por inatividade', 'warning');
            setCurrentUser(null);
          }
        }, 30000);
        return () => {
          window.removeEventListener('mousemove', resetActivity);
          window.removeEventListener('keydown', resetActivity);
          window.removeEventListener('touchstart', resetActivity);
          clearInterval(check);
        };
      }, [currentUser]);

      const handleLogout = () => {
        if (currentUser) DEMO_DATA.logs.unshift({ id: genId(), tipo: 'LOGOUT', ator: `${currentUser.posto} ${currentUser.nome} (${currentUser.matricula})`, acao: 'Logout manual', ts: new Date().toISOString() });
        toast('Sessão encerrada', 'info');
        setCurrentUser(null);
      };

      if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;

      const canAccess = (minPerfil) => hasPermission(currentUser, minPerfil);
      const servicosAtivos = DEMO_DATA.servicos.filter(s => s.status === 'Ativo');

      const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'PRINCIPAL' },
        { id: 'entrada', label: 'Entrada de Serviço', icon: '🚔', section: 'OPERACIONAL' },
        { id: 'equipes', label: 'Equipes em Serviço', icon: '👮', section: 'OPERACIONAL', badge: servicosAtivos.length || null },
        { id: 'rop', label: 'ROP / Ocorrências', icon: '📋', section: 'OPERACIONAL' },
        { id: 'armamento', label: 'Armamento', icon: '🔫', section: 'OPERACIONAL' },
        { id: 'viaturas', label: 'Viaturas', icon: '🚗', section: 'GESTÃO' },
        { id: 'historico', label: 'Histórico', icon: '📂', section: 'GESTÃO' },
        { id: 'auditoria', label: 'Auditoria', icon: '📜', section: 'GESTÃO', show: canAccess('fiscal_policiamento') },
        { id: 'usuarios', label: 'Usuários', icon: '👤', section: 'ADMINISTRAÇÃO', show: canAccess('administrativo') },
        { id: 'dev', label: 'Painel Dev', icon: '⚙️', section: 'ADMINISTRAÇÃO', show: currentUser.perfil === 'dev' },
      ].filter(n => n.show !== false);

      const sections = [...new Set(NAV_ITEMS.map(n => n.section))];

      const PAGES = {
        dashboard: Dashboard,
        entrada: EntradaServico,
        equipes: EquipesServico,
        rop: RegistroOcorrencias,
        armamento: GestaoArmamento,
        auditoria: Auditoria,
        historico: Historico,
        usuarios: GestaoUsuarios,
        dev: PainelDev,
        viaturas: GestaoViaturas,
      };

      const PageComponent = PAGES[activePage] || Dashboard;
      const pageTitle = NAV_ITEMS.find(n => n.id === activePage)?.label || 'Dashboard';

      const navigate = (page) => {
        setActivePage(page);
        setMobileSidebarOpen(false);
      };

      return (
        <AppContext.Provider value={{ user: currentUser, setUser: setCurrentUser }}>
          {inactiveWarning && (
            <div className="inactivity-banner">
              ⚠ Sessão encerrará por inatividade em breve. Mova o mouse ou toque na tela para continuar.
            </div>
          )}
          <div className="app" style={{ paddingTop: inactiveWarning ? 36 : 0 }}>
            {/* OVERLAY MOBILE */}
            <div className={`mobile-overlay ${mobileSidebarOpen ? 'show' : ''}`} onClick={() => setMobileSidebarOpen(false)} />

            {/* SIDEBAR */}
            <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
              <div className="sidebar-header">
                <div className="sidebar-logo">PM</div>
                {!sidebarCollapsed && (
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="sidebar-title">SISOP</div>
                    <div className="sidebar-subtitle">BATALHÃO</div>
                  </div>
                )}
                <button className="btn btn-icon btn-sm" onClick={() => setSidebarCollapsed(p => !p)} style={{ minWidth: 28 }}>
                  {sidebarCollapsed ? '→' : '←'}
                </button>
              </div>

              <div className="sidebar-nav">
                {sections.map(sec => (
                  <div key={sec}>
                    {!sidebarCollapsed && <div className="nav-section-label">{sec}</div>}
                    {NAV_ITEMS.filter(n => n.section === sec).map(n => (
                      <button key={n.id} className={`nav-item ${activePage === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)} title={sidebarCollapsed ? n.label : ''}>
                        <span className="nav-icon">{n.icon}</span>
                        {!sidebarCollapsed && <span className="nav-text">{n.label}</span>}
                        {!sidebarCollapsed && n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <div className="sidebar-footer">
                <div className="user-card" onClick={handleLogout} title="Clique para sair">
                  <div className="user-avatar">{getInitials(currentUser.nome)}</div>
                  {!sidebarCollapsed && (
                    <div className="user-info">
                      <div className="user-name">{currentUser.posto} {currentUser.nome.split(' ')[0]}</div>
                      <div className="user-role">{PERFIS_LABELS[currentUser.perfil] || currentUser.perfil} · SAIR</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN */}
            <div className="main">
              <div className="topbar">
                <button className="menu-toggle" onClick={() => setMobileSidebarOpen(p => !p)}>☰</button>
                <span className="topbar-title">{pageTitle}</span>
                <span className="topbar-badge">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="badge badge-green" style={{ display: 'none' }} id="online-badge">ONLINE</span>
              </div>
              <div className="content">
                <PageComponent />
              </div>
            </div>
          </div>
        </AppContext.Provider>
      );
    };

    // ─── ROOT ─────────────────────────────────────────────────────────────────
    const Root = () => (
      <ToastProvider>
        <App />
      </ToastProvider>
    );

    ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
  </script>
</body>
</html>