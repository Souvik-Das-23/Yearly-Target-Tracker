/**
 * Aegis Yearly Target Tracker - Storage Manager
 * 100% Client-Side LocalStorage Persistence & Backup Operations
 */

const AegisStorage = (function() {
  const STORAGE_KEY = 'aegis_yearly_targets_data_v1';
  const SETTINGS_KEY = 'aegis_yearly_settings_v1';

  // Available categories with metadata
  const CATEGORIES = {
    career: { label: 'Career & Work', icon: '💼', color: '#10b981' },
    finance: { label: 'Finance & Wealth', icon: '💰', color: '#f59e0b' },
    health: { label: 'Health & Fitness', icon: '🏃', color: '#f43f5e' },
    growth: { label: 'Personal Growth', icon: '📚', color: '#6366f1' },
    relationships: { label: 'Relationships', icon: '👥', color: '#a855f7' },
    travel: { label: 'Travel & Lifestyle', icon: '✈️', color: '#06b6d4' },
    creative: { label: 'Creative & Hobbies', icon: '🎨', color: '#f97316' }
  };

  /**
   * Reads raw root database from localStorage
   */
  function getRawDatabase() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { years: {} };
    } catch (e) {
      console.error('Error parsing localStorage database:', e);
      return { years: {} };
    }
  }

  /**
   * Writes raw root database back to localStorage
   */
  function saveRawDatabase(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      console.error('Error writing to localStorage:', e);
      return false;
    }
  }

  /**
   * Retrieves user preferences (theme, last selected year, view mode)
   */
  function getSettings() {
    try {
      const currentCalendarYear = new Date().getFullYear();
      const settings = localStorage.getItem(SETTINGS_KEY);
      return settings ? JSON.parse(settings) : {
        theme: 'dark',
        selectedYear: currentCalendarYear,
        viewMode: 'grid'
      };
    } catch (e) {
      return {
        theme: 'dark',
        selectedYear: new Date().getFullYear(),
        viewMode: 'grid'
      };
    }
  }

  function saveSettings(settings) {
    try {
      const current = getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  /**
   * Get all targets for a particular year
   */
  function getTargetsForYear(year) {
    const db = getRawDatabase();
    return db.years && db.years[year] ? db.years[year] : [];
  }

  /**
   * Get a single target by ID
   */
  function getTargetById(year, id) {
    const targets = getTargetsForYear(year);
    return targets.find(t => t.id === id) || null;
  }

  /**
   * Save (create or update) a target
   */
  function saveTarget(year, targetData) {
    const db = getRawDatabase();
    if (!db.years) db.years = {};
    if (!db.years[year]) db.years[year] = [];

    const now = new Date().toISOString();
    let isNew = false;

    if (!targetData.id) {
      // Create new
      isNew = true;
      targetData.id = 'tgt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      targetData.createdAt = now;
      targetData.updatedAt = now;
      db.years[year].unshift(targetData);
    } else {
      // Update existing
      const index = db.years[year].findIndex(t => t.id === targetData.id);
      if (index !== -1) {
        targetData.updatedAt = now;
        db.years[year][index] = { ...db.years[year][index], ...targetData };
      } else {
        targetData.createdAt = now;
        targetData.updatedAt = now;
        db.years[year].unshift(targetData);
      }
    }

    saveRawDatabase(db);
    return { target: targetData, isNew };
  }

  /**
   * Delete a target by ID
   */
  function deleteTarget(year, targetId) {
    const db = getRawDatabase();
    if (!db.years || !db.years[year]) return false;

    db.years[year] = db.years[year].filter(t => t.id !== targetId);
    saveRawDatabase(db);
    return true;
  }

  /**
   * Update numeric progress (increment or decrement or direct set)
   */
  function adjustTargetProgress(year, targetId, delta) {
    const db = getRawDatabase();
    if (!db.years || !db.years[year]) return null;

    const target = db.years[year].find(t => t.id === targetId);
    if (!target) return null;

    if (target.type === 'metric') {
      const cur = parseFloat(target.currentValue) || 0;
      const goal = parseFloat(target.goalValue) || 1;
      let next = cur + delta;
      if (next < 0) next = 0;
      target.currentValue = next;
      target.isCompleted = target.currentValue >= goal;
    } else if (target.type === 'binary') {
      target.isCompleted = !target.isCompleted;
      target.currentValue = target.isCompleted ? 1 : 0;
    }

    target.updatedAt = new Date().toISOString();
    saveRawDatabase(db);
    return target;
  }

  /**
   * Toggle a milestone subtask
   */
  function toggleMilestone(year, targetId, milestoneId) {
    const db = getRawDatabase();
    if (!db.years || !db.years[year]) return null;

    const target = db.years[year].find(t => t.id === targetId);
    if (!target || !target.milestones) return null;

    const ms = target.milestones.find(m => m.id === milestoneId);
    if (ms) {
      ms.completed = !ms.completed;
      const total = target.milestones.length;
      const completedCount = target.milestones.filter(m => m.completed).length;
      target.currentValue = completedCount;
      target.goalValue = total;
      target.isCompleted = total > 0 && completedCount === total;
      target.updatedAt = new Date().toISOString();
      saveRawDatabase(db);
    }
    return target;
  }

  /**
   * Toggle target full completion status
   */
  function toggleTargetCompletion(year, targetId) {
    const db = getRawDatabase();
    if (!db.years || !db.years[year]) return null;

    const target = db.years[year].find(t => t.id === targetId);
    if (!target) return null;

    target.isCompleted = !target.isCompleted;
    if (target.type === 'metric') {
      if (target.isCompleted) {
        target.currentValue = target.goalValue;
      } else {
        target.currentValue = 0;
      }
    } else if (target.type === 'milestone' && target.milestones) {
      target.milestones.forEach(m => m.completed = target.isCompleted);
      target.currentValue = target.isCompleted ? target.milestones.length : 0;
    }

    target.updatedAt = new Date().toISOString();
    saveRawDatabase(db);
    return target;
  }

  /**
   * Load rich, inspiring sample data for immediate demo & testing
   */
  function seedSampleData(year) {
    const sampleTargets = [
      {
        id: 'tgt_sample_1',
        title: 'Read 24 Non-Fiction Books',
        category: 'growth',
        quarter: 'All Year',
        priority: 'high',
        type: 'metric',
        currentValue: 14,
        goalValue: 24,
        unit: 'books',
        notes: 'Expand horizons in psychology, system architecture, and investing.',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tgt_sample_2',
        title: 'Emergency Fund Savings ($15,000)',
        category: 'finance',
        quarter: 'Q3',
        priority: 'high',
        type: 'metric',
        currentValue: 12000,
        goalValue: 15000,
        unit: '$',
        notes: '6 months of living expenses safely deposited in high-yield account.',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tgt_sample_3',
        title: 'Run a Half Marathon (21.1 km)',
        category: 'health',
        quarter: 'Q2',
        priority: 'medium',
        type: 'milestone',
        currentValue: 3,
        goalValue: 4,
        unit: 'steps',
        milestones: [
          { id: 'm1', title: 'Complete 5k continuous run', completed: true },
          { id: 'm2', title: 'Achieve 10k in under 55 mins', completed: true },
          { id: 'm3', title: 'Run 16k long weekend training', completed: true },
          { id: 'm4', title: 'Race Day: Finish Half Marathon', completed: false }
        ],
        notes: 'Consistent weekly mileage and injury prevention stretches.',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tgt_sample_4',
        title: 'Earn Cloud Architect Certification',
        category: 'career',
        quarter: 'Q2',
        priority: 'high',
        type: 'binary',
        currentValue: 1,
        goalValue: 1,
        unit: 'cert',
        notes: 'Complete exam prep course and pass official certification exam.',
        isCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tgt_sample_5',
        title: 'Bi-Weekly Family Quality Days',
        category: 'relationships',
        quarter: 'All Year',
        priority: 'medium',
        type: 'metric',
        currentValue: 18,
        goalValue: 26,
        unit: 'days',
        notes: 'Dedicated screen-free days for cooking, hikes, and meaningful conversations.',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tgt_sample_6',
        title: 'Explore Japan (Tokyo & Kyoto)',
        category: 'travel',
        quarter: 'Q4',
        priority: 'medium',
        type: 'milestone',
        currentValue: 2,
        goalValue: 4,
        unit: 'steps',
        milestones: [
          { id: 't1', title: 'Plan 12-day itinerary & book flights', completed: true },
          { id: 't2', title: 'Reserve Ryokan & Shinkansen passes', completed: true },
          { id: 't3', title: 'Learn 50 essential travel phrases in Japanese', completed: false },
          { id: 't4', title: 'Embark on the journey!', completed: false }
        ],
        notes: 'Autumn foliage season experience.',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tgt_sample_7',
        title: 'Build & Release Open-Source Project',
        category: 'creative',
        quarter: 'Q3',
        priority: 'low',
        type: 'binary',
        currentValue: 0,
        goalValue: 1,
        unit: 'release',
        notes: 'Publish on GitHub with documentation, unit tests, and demo page.',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const db = getRawDatabase();
    if (!db.years) db.years = {};
    db.years[year] = sampleTargets;
    saveRawDatabase(db);
    return sampleTargets;
  }

  /**
   * Clear all targets for a particular year
   */
  function clearYearData(year) {
    const db = getRawDatabase();
    if (db.years && db.years[year]) {
      db.years[year] = [];
      saveRawDatabase(db);
    }
    return true;
  }

  /**
   * Export all data to a downloadable JSON file
   */
  function exportToJsonFile() {
    const db = getRawDatabase();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis-targets-backup-${timestamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Import data from JSON string
   */
  function importFromJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      // Basic structure validation
      if (!parsed.years && typeof parsed === 'object') {
        // Maybe it's directly an object of years or an array
        if (Array.isArray(parsed)) {
          const year = new Date().getFullYear();
          const db = getRawDatabase();
          db.years[year] = parsed;
          saveRawDatabase(db);
          return true;
        }
      }

      saveRawDatabase(parsed);
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }

  return {
    CATEGORIES,
    getSettings,
    saveSettings,
    getTargetsForYear,
    getTargetById,
    saveTarget,
    deleteTarget,
    adjustTargetProgress,
    toggleMilestone,
    toggleTargetCompletion,
    seedSampleData,
    clearYearData,
    exportToJsonFile,
    importFromJson
  };
})();
