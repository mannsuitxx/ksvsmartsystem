/**
 * Calculates student risk profile.
 * @param {number} attendancePercentage - Student's overall attendance percentage (0 to 100)
 * @param {boolean} hasLowMarks - Whether the student has low marks (< 40% in any subject or overall)
 * @returns {Object} { score: number, level: string, reasons: string[] }
 */
function calculateRisk(attendancePercentage, hasLowMarks) {
  let score = 0;
  let level = 'Safe';
  const reasons = [];

  if (attendancePercentage < 75) {
    score += 50;
    reasons.push('Low Attendance (<75%)');
  }
  if (hasLowMarks) {
    score += 30;
    reasons.push('Low Marks (<40%)');
  }

  if (attendancePercentage < 75 && hasLowMarks) {
    level = 'High Risk';
    reasons.push('CRITICAL: Low Attendance & Low Marks');
  } else if (attendancePercentage < 75 || hasLowMarks) {
    level = 'Moderate Risk';
  }

  return { score, level, reasons };
}

module.exports = { calculateRisk };
