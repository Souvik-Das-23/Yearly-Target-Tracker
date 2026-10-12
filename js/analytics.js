/**
 * Aegis Yearly Target Tracker - Analytics & Pacing Engine
 */

const AegisAnalytics = (function() {
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  function calculateYearTimeMetrics(year) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const totalDays = isLeapYear(year) ? 366 : 365;

    if (year < currentYear) {
      return { isCurrentYear: false, daysElapsed: totalDays, daysRemaining: 0, totalDays, percentElapsed: 100, statusText: 'Year concluded' };
    }
    if (year > currentYear) {
      return { isCurrentYear: false, daysElapsed: 0, daysRemaining: totalDays, totalDays, percentElapsed: 0, statusText: 'Upcoming year' };
    }

    const startOfYear = new Date(year, 0, 1);
    const diffTime = Math.abs(now - startOfYear);
    const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const daysRemaining = Math.max(0, totalDays - dayOfYear);
    const percentElapsed = Math.min(100, Math.max(0, Math.round((dayOfYear / totalDays) * 100)));

    return { isCurrentYear: true, daysElapsed: dayOfYear, daysRemaining, totalDays, percentElapsed, statusText: `${percentElapsed}% of year passed` };
  }

  return { isLeapYear, calculateYearTimeMetrics };
})();
