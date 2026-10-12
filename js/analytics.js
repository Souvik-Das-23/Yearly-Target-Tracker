/**
 * Aegis Yearly Target Tracker - Analytics & Pacing Engine
 * Computes calendar progression, target completion scores, and category metrics
 */

const AegisAnalytics = (function() {
  /**
   * Determine if a year is a leap year
   */
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Calculates the time elapsed in a given year
   */
  function calculateYearTimeMetrics(year) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const totalDays = isLeapYear(year) ? 366 : 365;

    if (year < currentYear) {
      return {
        isCurrentYear: false,
        daysElapsed: totalDays,
        daysRemaining: 0,
        totalDays,
        percentElapsed: 100,
        statusText: 'Year concluded'
      };
    }

    if (year > currentYear) {
      return {
        isCurrentYear: false,
        daysElapsed: 0,
        daysRemaining: totalDays,
        totalDays,
        percentElapsed: 0,
        statusText: 'Upcoming year'
      };
    }

    // Current year
    const startOfYear = new Date(year, 0, 1);
    const diffTime = Math.abs(now - startOfYear);
    const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const daysRemaining = Math.max(0, totalDays - dayOfYear);
    const percentElapsed = Math.min(100, Math.max(0, Math.round((dayOfYear / totalDays) * 100)));

    return {
      isCurrentYear: true,
      daysElapsed: dayOfYear,
      daysRemaining,
      totalDays,
      percentElapsed,
      statusText: `${percentElapsed}% of year passed`
    };
  }

  /**
   * Calculates completion percentage for a single target
   */
  function getTargetProgressPercentage(target) {
    if (target.isCompleted) return 100;

    if (target.type === 'binary') {
      return target.isCompleted ? 100 : 0;
    }

    if (target.type === 'milestone') {
      if (!target.milestones || target.milestones.length === 0) {
        return target.isCompleted ? 100 : 0;
      }
      const completedCount = target.milestones.filter(m => m.completed).length;
      return Math.round((completedCount / target.milestones.length) * 100);
    }

    // Metric
    const current = parseFloat(target.currentValue) || 0;
    const goal = parseFloat(target.goalValue) || 1;
    if (goal <= 0) return 0;
    const pct = Math.round((current / goal) * 100);
    return Math.min(100, Math.max(0, pct));
  }

  /**
   * Computes holistic statistics for all targets in a year
   */
  function computeYearSummary(targets, year) {
    const totalCount = targets.length;
    if (totalCount === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        overallScore: 0,
        categoryStats: {},
        quarterStats: { Q1: { total: 0, done: 0 }, Q2: { total: 0, done: 0 }, Q3: { total: 0, done: 0 }, Q4: { total: 0, done: 0 } },
        pacing: {
          indicator: 'On Track',
          cssClass: 'on-track',
          deltaText: 'No targets set yet',
          yearElapsedPct: calculateYearTimeMetrics(year).percentElapsed,
          daysRemaining: calculateYearTimeMetrics(year).daysRemaining
        }
      };
    }

    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    let sumPercentages = 0;

    const quarterStats = {
      Q1: { total: 0, done: 0 },
      Q2: { total: 0, done: 0 },
      Q3: { total: 0, done: 0 },
      Q4: { total: 0, done: 0 },
      'All Year': { total: 0, done: 0 }
    };

    const categoryStats = {};

    targets.forEach(target => {
      const pct = getTargetProgressPercentage(target);
      sumPercentages += pct;

      if (pct === 100 || target.isCompleted) {
        completedCount++;
      } else if (pct > 0) {
        inProgressCount++;
      } else {
        notStartedCount++;
      }

      // Quarter
      const q = target.quarter || 'All Year';
      if (quarterStats[q]) {
        quarterStats[q].total++;
        if (pct === 100 || target.isCompleted) quarterStats[q].done++;
      }

      // Category
      const cat = target.category || 'other';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, done: 0, sumPct: 0 };
      }
      categoryStats[cat].total++;
      categoryStats[cat].sumPct += pct;
      if (pct === 100 || target.isCompleted) {
        categoryStats[cat].done++;
      }
    });

    const overallScore = Math.round(sumPercentages / totalCount);
    const timeMetrics = calculateYearTimeMetrics(year);

    // Compute Pacing vs Calendar
    let pacingIndicator = 'On Track';
    let pacingClass = 'on-track';
    let deltaText = 'Maintaining balanced pace';

    if (timeMetrics.isCurrentYear) {
      const delta = overallScore - timeMetrics.percentElapsed;
      if (delta >= 5) {
        pacingIndicator = 'Ahead of Schedule 🚀';
        pacingClass = 'ahead';
        deltaText = `+${delta}% ahead of calendar pace`;
      } else if (delta <= -15) {
        pacingIndicator = 'Needs Focus ⚠️';
        pacingClass = 'attention';
        deltaText = `${Math.abs(delta)}% behind calendar pace`;
      } else if (delta < -25) {
        pacingIndicator = 'Falling Behind ⏳';
        pacingClass = 'behind';
        deltaText = `${Math.abs(delta)}% behind calendar pace`;
      } else {
        pacingIndicator = 'On Track 🎯';
        pacingClass = 'on-track';
        deltaText = 'Pacing steadily with the calendar';
      }
    } else if (year < new Date().getFullYear()) {
      pacingIndicator = overallScore >= 80 ? 'Year Mastered 🏆' : 'Past Year Archive';
      pacingClass = overallScore >= 80 ? 'ahead' : 'on-track';
      deltaText = `${completedCount} of ${totalCount} targets completed`;
    } else {
      pacingIndicator = 'Prepared for Future 🌟';
      pacingClass = 'on-track';
      deltaText = 'Future year planning';
    }

    return {
      total: totalCount,
      completed: completedCount,
      inProgress: inProgressCount,
      notStarted: notStartedCount,
      overallScore,
      categoryStats,
      quarterStats,
      pacing: {
        indicator: pacingIndicator,
        cssClass: pacingClass,
        deltaText,
        yearElapsedPct: timeMetrics.percentElapsed,
        daysRemaining: timeMetrics.daysRemaining
      }
    };
  }

  return {
    isLeapYear,
    calculateYearTimeMetrics,
    getTargetProgressPercentage,
    computeYearSummary
  };
})();
