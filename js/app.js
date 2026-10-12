/**
 * Aegis Yearly Target Tracker - Main Application Coordinator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    selectedYear: new Date().getFullYear(),
    viewMode: 'grid', // 'grid' | 'quarters' | 'list'
    activeQuarterFilter: 'all', // 'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
    activeCategoryFilter: 'all',
    activeStatusFilter: 'all',
    activePriorityFilter: 'all',
    searchQuery: '',
    temporaryMilestones: [] // Used when editing/creating milestone targets
  };

  // DOM Elements
  const elements = {
    yearSelector: document.getElementById('yearSelector'),
    prevYearBtn: document.getElementById('prevYearBtn'),
    nextYearBtn: document.getElementById('nextYearBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    dataMenuBtn: document.getElementById('dataMenuBtn'),
    newTargetBtn: document.getElementById('newTargetBtn'),
    emptyNewTargetBtn: document.getElementById('emptyNewTargetBtn'),
    quickSampleBtn: document.getElementById('quickSampleBtn'),
    emptySampleBtn: document.getElementById('emptySampleBtn'),
    heroYearLabel: document.getElementById('heroYearLabel'),
    completionRateBadge: document.getElementById('completionRateBadge'),
    mainRadialBar: document.getElementById('mainRadialBar'),
    mainScorePercent: document.getElementById('mainScorePercent'),
    totalTargetsCount: document.getElementById('totalTargetsCount'),
    completedTargetsCount: document.getElementById('completedTargetsCount'),
    inProgressTargetsCount: document.getElementById('inProgressTargetsCount'),
    notStartedTargetsCount: document.getElementById('notStartedTargetsCount'),
    pacingDaysRemaining: document.getElementById('pacingDaysRemaining'),
    pacingPaceIndicator: document.getElementById('pacingPaceIndicator'),
    yearTimeElapsedBar: document.getElementById('yearTimeElapsedBar'),
    targetScoreMarker: document.getElementById('targetScoreMarker'),
    yearElapsedText: document.getElementById('yearElapsedText'),
    pacingDeltaText: document.getElementById('pacingDeltaText'),
    categoryBarsContainer: document.getElementById('categoryBarsContainer'),
    q1Stat: document.getElementById('q1Stat'),
    q2Stat: document.getElementById('q2Stat'),
    q3Stat: document.getElementById('q3Stat'),
    q4Stat: document.getElementById('q4Stat'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    quarterFilterTabs: document.getElementById('quarterFilterTabs'),
    categoryFilter: document.getElementById('categoryFilter'),
    statusFilter: document.getElementById('statusFilter'),
    priorityFilter: document.getElementById('priorityFilter'),
    viewModeToggle: document.getElementById('viewModeToggle'),
    targetsContainer: document.getElementById('targetsContainer'),
    emptyState: document.getElementById('emptyState'),
    // Target Modal
    targetModal: document.getElementById('targetModal'),
    modalTitle: document.getElementById('modalTitle'),
    targetForm: document.getElementById('targetForm'),
    targetId: document.getElementById('targetId'),
    targetTitle: document.getElementById('targetTitle'),
    targetCategory: document.getElementById('targetCategory'),
    targetQuarter: document.getElementById('targetQuarter'),
    targetPriority: document.getElementById('targetPriority'),
    targetType: document.getElementById('targetType'),
    metricFieldsSection: document.getElementById('metricFieldsSection'),
    targetCurrentValue: document.getElementById('targetCurrentValue'),
    targetGoalValue: document.getElementById('targetGoalValue'),
    targetUnit: document.getElementById('targetUnit'),
    milestonesSection: document.getElementById('milestonesSection'),
    newMilestoneInput: document.getElementById('newMilestoneInput'),
    addMilestoneBtn: document.getElementById('addMilestoneBtn'),
    milestonesList: document.getElementById('milestonesList'),
    targetNotes: document.getElementById('targetNotes'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    // Data Modal
    dataModal: document.getElementById('dataModal'),
    closeDataModalBtn: document.getElementById('closeDataModalBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonBtn: document.getElementById('importJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    printReportBtn: document.getElementById('printReportBtn'),
    resetYearBtn: document.getElementById('resetYearBtn'),
    // Detail Modal
    targetDetailModal: document.getElementById('targetDetailModal'),
    detailCategoryBadge: document.getElementById('detailCategoryBadge'),
    detailTargetTitle: document.getElementById('detailTargetTitle'),
    detailModalBody: document.getElementById('detailModalBody'),
    closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
    // Toast
    toastContainer: document.getElementById('toastContainer'),
    // Mobile FAB
    mobileFabBtn: document.getElementById('mobileFabBtn')
  };

  /* --------------------------------------------------------------------------
     Initialization
     -------------------------------------------------------------------------- */
  function init() {
    // Load Settings
    const settings = AegisStorage.getSettings();
    state.selectedYear = parseInt(settings.selectedYear, 10) || new Date().getFullYear();
    state.viewMode = settings.viewMode || 'grid';
    applyTheme(settings.theme || 'dark');

    setupYearDropdown();
    setupViewModeButtons();
    bindEvents();
    renderAll();
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    AegisStorage.saveSettings({ theme });
  }

  function setupYearDropdown() {
    elements.yearSelector.innerHTML = '';
    const currentCalYear = new Date().getFullYear();
    const startYear = currentCalYear - 2;
    const endYear = currentCalYear + 4;

    for (let y = startYear; y <= endYear; y++) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = `Year ${y}`;
      if (y === state.selectedYear) {
        opt.selected = true;
      }
      elements.yearSelector.appendChild(opt);
    }
  }

  function setupViewModeButtons() {
    elements.viewModeToggle.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === state.viewMode);
    });
  }

  /* --------------------------------------------------------------------------
     Event Listeners
     -------------------------------------------------------------------------- */
  function bindEvents() {
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.dataset.theme || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme} mode`, 'info');
    });

    // Year selection
    elements.yearSelector.addEventListener('change', (e) => {
      state.selectedYear = parseInt(e.target.value, 10);
      AegisStorage.saveSettings({ selectedYear: state.selectedYear });
      renderAll();
    });

    elements.prevYearBtn.addEventListener('click', () => {
      state.selectedYear--;
      updateYearSelectValue();
      renderAll();
    });

    elements.nextYearBtn.addEventListener('click', () => {
      state.selectedYear++;
      updateYearSelectValue();
      renderAll();
    });

    // View mode
    elements.viewModeToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-btn');
      if (!btn) return;
      state.viewMode = btn.dataset.view;
      AegisStorage.saveSettings({ viewMode: state.viewMode });
      setupViewModeButtons();
      renderTargets();
    });

    // Search
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      renderTargets();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      elements.clearSearchBtn.style.display = 'none';
      renderTargets();
    });

    // Quarter Tabs
    elements.quarterFilterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab-btn');
      if (!tab) return;
      elements.quarterFilterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tab.classList.add('active');
      state.activeQuarterFilter = tab.dataset.quarter;
      renderTargets();
    });

    // Filter Dropdowns
    elements.categoryFilter.addEventListener('change', (e) => {
      state.activeCategoryFilter = e.target.value;
      renderTargets();
    });

    elements.statusFilter.addEventListener('change', (e) => {
      state.activeStatusFilter = e.target.value;
      renderTargets();
    });

    elements.priorityFilter.addEventListener('change', (e) => {
      state.activePriorityFilter = e.target.value;
      renderTargets();
    });

    // Modals
    elements.newTargetBtn.addEventListener('click', () => openTargetModal());
    if (elements.mobileFabBtn) {
      elements.mobileFabBtn.addEventListener('click', () => openTargetModal());
    }
    elements.emptyNewTargetBtn.addEventListener('click', () => openTargetModal());
    elements.closeModalBtn.addEventListener('click', closeTargetModal);
    elements.cancelModalBtn.addEventListener('click', closeTargetModal);

    elements.dataMenuBtn.addEventListener('click', openDataModal);
    elements.closeDataModalBtn.addEventListener('click', closeDataModal);
    elements.closeDetailModalBtn.addEventListener('click', closeDetailModal);

    // Target Type Changed in Modal
    elements.targetType.addEventListener('change', handleTargetTypeChange);

    // Milestones Builder in Modal
    elements.addMilestoneBtn.addEventListener('click', addMilestoneItem);
    elements.newMilestoneInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addMilestoneItem();
      }
    });

    // Target Form Submit
    elements.targetForm.addEventListener('submit', handleTargetFormSubmit);

    // Quick Sample Buttons
    elements.quickSampleBtn.addEventListener('click', () => loadSampleDataWithConfirm());
    elements.emptySampleBtn.addEventListener('click', () => loadSampleDataWithConfirm());

    // Data Modal Actions
    elements.exportJsonBtn.addEventListener('click', () => {
      AegisStorage.exportToJsonFile();
      showToast('Backup JSON exported successfully!', 'success');
    });

    elements.importJsonBtn.addEventListener('click', () => {
      elements.importJsonInput.click();
    });

    elements.importJsonInput.addEventListener('change', handleFileImport);

    elements.printReportBtn.addEventListener('click', () => {
      window.print();
    });

    elements.resetYearBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to clear all targets for year ${state.selectedYear}? This cannot be undone.`)) {
        AegisStorage.clearYearData(state.selectedYear);
        renderAll();
        closeDataModal();
        showToast(`Cleared targets for year ${state.selectedYear}`, 'info');
      }
    });

    // Global Click handler for cards (actions, steppers, complete toggle)
    elements.targetsContainer.addEventListener('click', handleTargetCardClick);

    // Close Modals on click outside
    [elements.targetModal, elements.dataModal, elements.targetDetailModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Close card dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.card-actions-menu')) {
        document.querySelectorAll('.card-dropdown.show').forEach(d => d.classList.remove('show'));
      }
    });
  }

  function updateYearSelectValue() {
    let exists = false;
    for (let opt of elements.yearSelector.options) {
      if (parseInt(opt.value, 10) === state.selectedYear) {
        opt.selected = true;
        exists = true;
        break;
      }
    }
    if (!exists) {
      setupYearDropdown();
    }
    AegisStorage.saveSettings({ selectedYear: state.selectedYear });
  }

  /* --------------------------------------------------------------------------
     Render Orchestration
     -------------------------------------------------------------------------- */
  function renderAll() {
    elements.heroYearLabel.textContent = `YEAR ${state.selectedYear} PROGRESS`;
    updateAnalyticsView();
    renderTargets();
  }

  function updateAnalyticsView() {
    const targets = AegisStorage.getTargetsForYear(state.selectedYear);
    const summary = AegisAnalytics.computeYearSummary(targets, state.selectedYear);

    // Score Badge & Numbers
    elements.completionRateBadge.textContent = `${summary.overallScore}% Complete`;
    elements.mainScorePercent.textContent = `${summary.overallScore}%`;

    // Radial Gauge
    const circumference = 314.159; // 2 * PI * 50
    const offset = circumference - (circumference * summary.overallScore) / 100;
    elements.mainRadialBar.style.strokeDashoffset = offset;

    // Stat Pills
    elements.totalTargetsCount.textContent = summary.total;
    elements.completedTargetsCount.textContent = summary.completed;
    elements.inProgressTargetsCount.textContent = summary.inProgress;
    elements.notStartedTargetsCount.textContent = summary.notStarted;

    // Pacing Bar
    elements.pacingDaysRemaining.textContent = summary.pacing.daysRemaining;
    elements.pacingPaceIndicator.textContent = summary.pacing.indicator;
    elements.pacingPaceIndicator.className = `pacing-status-indicator ${summary.pacing.cssClass}`;

    elements.yearTimeElapsedBar.style.width = `${summary.pacing.yearElapsedPct}%`;
    elements.targetScoreMarker.style.left = `${summary.overallScore}%`;

    elements.yearElapsedText.textContent = `${summary.pacing.yearElapsedPct}% of year elapsed`;
    elements.pacingDeltaText.textContent = summary.pacing.deltaText;

    // Category Bars
    renderCategoryBars(summary.categoryStats);

    // Quarterly Pills
    elements.q1Stat.textContent = `${summary.quarterStats.Q1.done}/${summary.quarterStats.Q1.total}`;
    elements.q2Stat.textContent = `${summary.quarterStats.Q2.done}/${summary.quarterStats.Q2.total}`;
    elements.q3Stat.textContent = `${summary.quarterStats.Q3.done}/${summary.quarterStats.Q3.total}`;
    elements.q4Stat.textContent = `${summary.quarterStats.Q4.done}/${summary.quarterStats.Q4.total}`;
  }

  function renderCategoryBars(catStats) {
    elements.categoryBarsContainer.innerHTML = '';
    const categories = AegisStorage.CATEGORIES;

    // Show categories that have at least 1 target, or top default categories
    let rendered = 0;
    Object.keys(categories).forEach(key => {
      const cat = categories[key];
      const stat = catStats[key] || { total: 0, done: 0, sumPct: 0 };
      const avgPct = stat.total > 0 ? Math.round(stat.sumPct / stat.total) : 0;

      if (stat.total > 0 || rendered < 4) {
        rendered++;
        const row = document.createElement('div');
        row.className = 'category-bar-row';
        row.innerHTML = `
          <div class="category-bar-meta">
            <span class="category-name-label">
              <span>${cat.icon}</span>
              <span>${cat.label}</span>
            </span>
            <span class="category-score-label">${avgPct}% (${stat.done}/${stat.total})</span>
          </div>
          <div class="category-track">
            <div class="category-fill" style="width: ${avgPct}%; background-color: ${cat.color};"></div>
          </div>
        `;
        elements.categoryBarsContainer.appendChild(row);
      }
    });

    if (rendered === 0) {
      elements.categoryBarsContainer.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem 0;">No active categories yet.</p>`;
    }
  }

  /* --------------------------------------------------------------------------
     Targets Rendering (Grid, Quarters Kanban, List)
     -------------------------------------------------------------------------- */
  function getFilteredTargets() {
    const all = AegisStorage.getTargetsForYear(state.selectedYear);

    return all.filter(target => {
      // Quarter filter
      if (state.activeQuarterFilter !== 'all') {
        if (target.quarter !== state.activeQuarterFilter && target.quarter !== 'All Year') {
          return false;
        }
      }

      // Category filter
      if (state.activeCategoryFilter !== 'all') {
        if (target.category !== state.activeCategoryFilter) {
          return false;
        }
      }

      // Status filter
      if (state.activeStatusFilter !== 'all') {
        const pct = AegisAnalytics.getTargetProgressPercentage(target);
        if (state.activeStatusFilter === 'completed' && (!target.isCompleted && pct < 100)) return false;
        if (state.activeStatusFilter === 'in_progress' && (pct === 0 || pct === 100 || target.isCompleted)) return false;
        if (state.activeStatusFilter === 'not_started' && (pct > 0 || target.isCompleted)) return false;
      }

      // Priority filter
      if (state.activePriorityFilter !== 'all') {
        if (target.priority !== state.activePriorityFilter) return false;
      }

      // Search query
      if (state.searchQuery) {
        const titleMatch = target.title.toLowerCase().includes(state.searchQuery);
        const notesMatch = target.notes && target.notes.toLowerCase().includes(state.searchQuery);
        const milestoneMatch = target.milestones && target.milestones.some(m => m.title.toLowerCase().includes(state.searchQuery));
        if (!titleMatch && !notesMatch && !milestoneMatch) return false;
      }

      return true;
    });
  }

  function renderTargets() {
    const filtered = getFilteredTargets();
    const allCount = AegisStorage.getTargetsForYear(state.selectedYear).length;

    // Toggle Empty state
    if (filtered.length === 0) {
      elements.targetsContainer.style.display = 'none';
      elements.emptyState.style.display = 'flex';
      return;
    }

    elements.emptyState.style.display = 'none';
    elements.targetsContainer.style.display = state.viewMode === 'list' ? 'flex' : 'grid';

    // Set container class for view
    elements.targetsContainer.className = `targets-container view-${state.viewMode}`;
    elements.targetsContainer.innerHTML = '';

    if (state.viewMode === 'grid') {
      filtered.forEach(target => {
        elements.targetsContainer.appendChild(createTargetCardElement(target));
      });
    } else if (state.viewMode === 'quarters') {
      renderQuarterBoard(filtered);
    } else if (state.viewMode === 'list') {
      filtered.forEach(target => {
        elements.targetsContainer.appendChild(createTargetListRowElement(target));
      });
    }
  }

  function createTargetCardElement(target) {
    const cat = AegisStorage.CATEGORIES[target.category] || { label: 'General', icon: '🎯', color: '#6366f1' };
    const pct = AegisAnalytics.getTargetProgressPercentage(target);
    const isDone = target.isCompleted || pct === 100;

    const card = document.createElement('div');
    card.className = `target-card ${isDone ? 'completed-card' : ''}`;
    card.dataset.id = target.id;

    // Progress counter text
    let counterHtml = '';
    if (target.type === 'metric') {
      counterHtml = `<strong>${target.currentValue}</strong> of ${target.goalValue} ${target.unit || ''}`;
    } else if (target.type === 'milestone') {
      const totalSteps = target.milestones ? target.milestones.length : 0;
      const completedSteps = target.milestones ? target.milestones.filter(m => m.completed).length : 0;
      counterHtml = `<strong>${completedSteps}</strong> of ${totalSteps} steps`;
    } else {
      counterHtml = isDone ? '<strong>Achieved</strong>' : 'Pending';
    }

    // Quick controls
    let quickControlsHtml = '';
    if (target.type === 'metric') {
      quickControlsHtml = `
        <div class="numeric-steppers">
          <button class="step-btn" data-action="decrement" title="Decrease progress">-1</button>
          <button class="step-btn" data-action="increment" title="Increase progress">+1</button>
        </div>
        <button class="complete-toggle-btn ${isDone ? 'done' : ''}" data-action="toggle-complete">
          ${isDone ? '✓ Done' : 'Complete'}
        </button>
      `;
    } else if (target.type === 'milestone') {
      quickControlsHtml = `
        <button class="action-btn secondary" data-action="open-milestones" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">
          📋 Checklist (${target.milestones ? target.milestones.filter(m => m.completed).length : 0}/${target.milestones ? target.milestones.length : 0})
        </button>
        <button class="complete-toggle-btn ${isDone ? 'done' : ''}" data-action="toggle-complete">
          ${isDone ? '✓ Done' : 'Mark All'}
        </button>
      `;
    } else {
      quickControlsHtml = `
        <button class="complete-toggle-btn ${isDone ? 'done' : ''}" data-action="toggle-complete">
          ${isDone ? '✓ Completed' : '○ Mark Achieved'}
        </button>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="target-card-top">
          <span class="target-category-pill" style="background-color: ${cat.color}20; color: ${cat.color};">
            <span>${cat.icon}</span>
            <span>${cat.label}</span>
          </span>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="target-priority-badge ${target.priority}">
              ● ${target.priority.toUpperCase()}
            </span>

            <div class="card-actions-menu">
              <button class="card-menu-btn" data-action="toggle-menu" aria-label="Card actions menu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
              <div class="card-dropdown">
                <button class="card-dropdown-item" data-action="edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                  Edit Target
                </button>
                <button class="card-dropdown-item delete" data-action="delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <h3 class="target-title-text">${escapeHtml(target.title)}</h3>
        ${target.notes ? `<p class="target-notes-text">${escapeHtml(target.notes)}</p>` : ''}
      </div>

      <div class="card-progress-section">
        <div class="card-progress-header">
          <span class="progress-counter-text">${counterHtml}</span>
          <span class="progress-percent-badge">${pct}%</span>
        </div>

        <div class="card-progress-track">
          <div class="card-progress-fill ${pct === 100 ? 'full' : ''}" style="width: ${pct}%;"></div>
        </div>

        <div class="card-quick-controls">
          <span class="quarter-tag">🗓️ ${target.quarter || 'All Year'}</span>
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            ${quickControlsHtml}
          </div>
        </div>
      </div>
    `;

    return card;
  }

  function renderQuarterBoard(targets) {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    quarters.forEach(q => {
      const col = document.createElement('div');
      col.className = 'quarter-column';

      const qTargets = targets.filter(t => t.quarter === q || t.quarter === 'All Year');

      col.innerHTML = `
        <div class="quarter-column-header">
          <span class="quarter-col-title">${q}</span>
          <span class="quarter-col-count">${qTargets.length}</span>
        </div>
        <div class="quarter-column-cards" id="col_${q}"></div>
      `;

      const cardsContainer = col.querySelector(`#col_${q}`);
      if (qTargets.length === 0) {
        cardsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin: auto;">No targets for ${q}</div>`;
      } else {
        qTargets.forEach(target => {
          cardsContainer.appendChild(createTargetCardElement(target));
        });
      }

      elements.targetsContainer.appendChild(col);
    });
  }

  function createTargetListRowElement(target) {
    const cat = AegisStorage.CATEGORIES[target.category] || { label: 'General', icon: '🎯', color: '#6366f1' };
    const pct = AegisAnalytics.getTargetProgressPercentage(target);
    const isDone = target.isCompleted || pct === 100;

    const row = document.createElement('div');
    row.className = `target-row-item ${isDone ? 'completed-card' : ''}`;
    row.dataset.id = target.id;

    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.2rem;">${cat.icon}</span>
        <div>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.15rem;">${escapeHtml(target.title)}</h4>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${cat.label} • ${target.quarter || 'All Year'}</span>
        </div>
      </div>

      <div>
        <span class="target-priority-badge ${target.priority}">● ${target.priority.toUpperCase()}</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.25rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600;">
          <span>${pct}%</span>
          <span>${target.type === 'metric' ? `${target.currentValue}/${target.goalValue} ${target.unit || ''}` : ''}</span>
        </div>
        <div class="card-progress-track" style="margin-bottom: 0;">
          <div class="card-progress-fill ${pct === 100 ? 'full' : ''}" style="width: ${pct}%;"></div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        ${target.type === 'metric' ? `
          <button class="step-btn" data-action="decrement">-</button>
          <button class="step-btn" data-action="increment">+</button>
        ` : ''}
        <button class="complete-toggle-btn ${isDone ? 'done' : ''}" data-action="toggle-complete">
          ${isDone ? '✓' : 'Mark Done'}
        </button>
      </div>

      <div class="card-actions-menu">
        <button class="card-menu-btn" data-action="toggle-menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
        <div class="card-dropdown">
          <button class="card-dropdown-item" data-action="edit">Edit</button>
          <button class="card-dropdown-item delete" data-action="delete">Delete</button>
        </div>
      </div>
    `;

    return row;
  }

  /* --------------------------------------------------------------------------
     Target Card Interactive Click Delegator
     -------------------------------------------------------------------------- */
  function handleTargetCardClick(e) {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const card = actionBtn.closest('[data-id]');
    if (!card) return;

    const targetId = card.dataset.id;
    const target = AegisStorage.getTargetById(state.selectedYear, targetId);
    if (!target) return;

    if (action === 'toggle-menu') {
      e.stopPropagation();
      const dropdown = card.querySelector('.card-dropdown');
      // Close other dropdowns
      document.querySelectorAll('.card-dropdown.show').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
      });
      if (dropdown) dropdown.classList.toggle('show');
      return;
    }

    if (action === 'edit') {
      openTargetModal(target);
      return;
    }

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete "${target.title}"?`)) {
        AegisStorage.deleteTarget(state.selectedYear, targetId);
        renderAll();
        showToast('Target deleted', 'info');
      }
      return;
    }

    if (action === 'increment') {
      const updated = AegisStorage.adjustTargetProgress(state.selectedYear, targetId, 1);
      if (updated && updated.isCompleted) {
        window.triggerConfetti && window.triggerConfetti(e.clientX, e.clientY);
        showToast(`Target "${updated.title}" achieved! 🎉`, 'success');
      }
      renderAll();
      return;
    }

    if (action === 'decrement') {
      AegisStorage.adjustTargetProgress(state.selectedYear, targetId, -1);
      renderAll();
      return;
    }

    if (action === 'toggle-complete') {
      const updated = AegisStorage.toggleTargetCompletion(state.selectedYear, targetId);
      if (updated && updated.isCompleted) {
        window.triggerConfetti && window.triggerConfetti(e.clientX, e.clientY);
        showToast(`Target achieved! 🏆`, 'success');
      }
      renderAll();
      return;
    }

    if (action === 'open-milestones') {
      openDetailModal(target);
      return;
    }
  }

  /* --------------------------------------------------------------------------
     Target Modal Management
     -------------------------------------------------------------------------- */
  function openTargetModal(targetToEdit = null) {
    state.temporaryMilestones = [];
    elements.targetForm.reset();

    if (targetToEdit) {
      elements.modalTitle.textContent = 'Edit Yearly Target';
      elements.targetId.value = targetToEdit.id;
      elements.targetTitle.value = targetToEdit.title;
      elements.targetCategory.value = targetToEdit.category;
      elements.targetQuarter.value = targetToEdit.quarter || 'All Year';
      elements.targetPriority.value = targetToEdit.priority || 'medium';
      elements.targetType.value = targetToEdit.type || 'metric';
      elements.targetNotes.value = targetToEdit.notes || '';

      if (targetToEdit.type === 'metric') {
        elements.targetCurrentValue.value = targetToEdit.currentValue || 0;
        elements.targetGoalValue.value = targetToEdit.goalValue || 10;
        elements.targetUnit.value = targetToEdit.unit || '';
      } else if (targetToEdit.type === 'milestone') {
        state.temporaryMilestones = (targetToEdit.milestones || []).map(m => ({ ...m }));
      }
    } else {
      elements.modalTitle.textContent = 'Set Yearly Target';
      elements.targetId.value = '';
      elements.targetType.value = 'metric';
      elements.targetCurrentValue.value = 0;
      elements.targetGoalValue.value = 10;
      elements.targetUnit.value = 'times';
    }

    handleTargetTypeChange();
    renderMilestonesBuilderList();
    elements.targetModal.classList.add('active');
    elements.targetTitle.focus();
  }

  function closeTargetModal() {
    elements.targetModal.classList.remove('active');
  }

  function handleTargetTypeChange() {
    const type = elements.targetType.value;
    if (type === 'metric') {
      elements.metricFieldsSection.style.display = 'block';
      elements.milestonesSection.style.display = 'none';
    } else if (type === 'milestone') {
      elements.metricFieldsSection.style.display = 'none';
      elements.milestonesSection.style.display = 'block';
    } else {
      // Binary
      elements.metricFieldsSection.style.display = 'none';
      elements.milestonesSection.style.display = 'none';
    }
  }

  function addMilestoneItem() {
    const text = elements.newMilestoneInput.value.trim();
    if (!text) return;

    state.temporaryMilestones.push({
      id: 'ms_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: text,
      completed: false
    });

    elements.newMilestoneInput.value = '';
    renderMilestonesBuilderList();
  }

  function renderMilestonesBuilderList() {
    elements.milestonesList.innerHTML = '';
    state.temporaryMilestones.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'milestone-builder-item';
      li.innerHTML = `
        <span>Step ${index + 1}: ${escapeHtml(item.title)}</span>
        <button type="button" class="milestone-remove-btn" data-index="${index}">&times;</button>
      `;

      li.querySelector('.milestone-remove-btn').addEventListener('click', () => {
        state.temporaryMilestones.splice(index, 1);
        renderMilestonesBuilderList();
      });

      elements.milestonesList.appendChild(li);
    });
  }

  function handleTargetFormSubmit(e) {
    e.preventDefault();

    const title = elements.targetTitle.value.trim();
    if (!title) {
      showToast('Please provide a target title', 'error');
      return;
    }

    const type = elements.targetType.value;
    const targetData = {
      id: elements.targetId.value || null,
      title,
      category: elements.targetCategory.value,
      quarter: elements.targetQuarter.value,
      priority: elements.targetPriority.value,
      type,
      notes: elements.targetNotes.value.trim()
    };

    if (type === 'metric') {
      targetData.currentValue = parseFloat(elements.targetCurrentValue.value) || 0;
      targetData.goalValue = parseFloat(elements.targetGoalValue.value) || 1;
      targetData.unit = elements.targetUnit.value.trim();
      targetData.isCompleted = targetData.currentValue >= targetData.goalValue;
    } else if (type === 'milestone') {
      targetData.milestones = state.temporaryMilestones;
      const total = targetData.milestones.length;
      const done = targetData.milestones.filter(m => m.completed).length;
      targetData.currentValue = done;
      targetData.goalValue = total;
      targetData.unit = 'steps';
      targetData.isCompleted = total > 0 && done === total;
    } else {
      // Binary
      targetData.currentValue = 0;
      targetData.goalValue = 1;
      targetData.isCompleted = false;
    }

    const res = AegisStorage.saveTarget(state.selectedYear, targetData);
    closeTargetModal();
    renderAll();
    showToast(res.isNew ? 'New target added!' : 'Target updated!', 'success');
  }

  /* --------------------------------------------------------------------------
     Milestones Detail Modal (Checklist viewer)
     -------------------------------------------------------------------------- */
  function openDetailModal(target) {
    const cat = AegisStorage.CATEGORIES[target.category] || { label: 'General', icon: '🎯', color: '#6366f1' };
    elements.detailCategoryBadge.textContent = `${cat.icon} ${cat.label}`;
    elements.detailCategoryBadge.style.color = cat.color;
    elements.detailCategoryBadge.style.borderColor = cat.color;
    elements.detailTargetTitle.textContent = target.title;

    elements.detailModalBody.innerHTML = '';

    const list = document.createElement('ul');
    list.className = 'detail-subtasks-list';

    if (!target.milestones || target.milestones.length === 0) {
      list.innerHTML = `<li style="color: var(--text-muted); font-size: 0.85rem;">No milestone steps defined yet.</li>`;
    } else {
      target.milestones.forEach(ms => {
        const item = document.createElement('li');
        item.className = `detail-subtask-item ${ms.completed ? 'completed' : ''}`;
        item.innerHTML = `
          <input type="checkbox" class="detail-checkbox" ${ms.completed ? 'checked' : ''}>
          <span>${escapeHtml(ms.title)}</span>
        `;

        item.addEventListener('click', (e) => {
          if (e.target.tagName !== 'INPUT') {
            const cb = item.querySelector('.detail-checkbox');
            cb.checked = !cb.checked;
          }
          const updated = AegisStorage.toggleMilestone(state.selectedYear, target.id, ms.id);
          if (updated) {
            item.classList.toggle('completed', !ms.completed);
            renderAll();
            if (updated.isCompleted) {
              window.triggerConfetti && window.triggerConfetti();
              showToast('All milestones completed! 🏆', 'success');
            }
          }
        });

        list.appendChild(item);
      });
    }

    elements.detailModalBody.appendChild(list);
    elements.targetDetailModal.classList.add('active');
  }

  function closeDetailModal() {
    elements.targetDetailModal.classList.remove('active');
  }

  /* --------------------------------------------------------------------------
     Data & Backup Modal Management
     -------------------------------------------------------------------------- */
  function openDataModal() {
    elements.dataModal.classList.add('active');
  }

  function closeDataModal() {
    elements.dataModal.classList.remove('active');
  }

  function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const success = AegisStorage.importFromJson(content);
      if (success) {
        renderAll();
        closeDataModal();
        showToast('Backup restored successfully!', 'success');
      } else {
        showToast('Invalid backup file. Could not restore data.', 'error');
      }
      elements.importJsonInput.value = '';
    };
    reader.readAsText(file);
  }

  function loadSampleDataWithConfirm() {
    const current = AegisStorage.getTargetsForYear(state.selectedYear);
    if (current.length > 0) {
      if (!confirm(`You already have ${current.length} target(s) for ${state.selectedYear}. Overwrite with sample targets?`)) {
        return;
      }
    }
    AegisStorage.seedSampleData(state.selectedYear);
    renderAll();
    showToast('Example targets loaded!', 'success');
  }

  /* --------------------------------------------------------------------------
     Toast Notifications & Utilities
     -------------------------------------------------------------------------- */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app
  init();
});
