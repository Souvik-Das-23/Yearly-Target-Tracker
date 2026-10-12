/**
 * Aegis Yearly Target Tracker - Storage Manager
 * 100% Client-Side LocalStorage Persistence & Backup Operations
 */

const AegisStorage = (function() {
  const STORAGE_KEY = 'aegis_yearly_targets_data_v1';
  const SETTINGS_KEY = 'aegis_yearly_settings_v1';

  function getRawDatabase() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { years: {} };
    } catch (e) {
      return { years: {} };
    }
  }

  function saveRawDatabase(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    getRawDatabase,
    saveRawDatabase
  };
})();
