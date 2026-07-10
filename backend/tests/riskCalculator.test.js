const { calculateRisk } = require('../utils/riskCalculator');

describe('Risk Calculator Utility', () => {
  test('should return Safe and 0 score when attendance is >= 75% and there are no low marks', () => {
    const result = calculateRisk(80, false);
    expect(result).toEqual({
      score: 0,
      level: 'Safe',
      reasons: []
    });
  });

  test('should return Moderate Risk and 50 score when attendance is < 75% but no low marks', () => {
    const result = calculateRisk(70, false);
    expect(result).toEqual({
      score: 50,
      level: 'Moderate Risk',
      reasons: ['Low Attendance (<75%)']
    });
  });

  test('should return Moderate Risk and 30 score when attendance is >= 75% but has low marks', () => {
    const result = calculateRisk(80, true);
    expect(result).toEqual({
      score: 30,
      level: 'Moderate Risk',
      reasons: ['Low Marks (<40%)']
    });
  });

  test('should return High Risk and 80 score when attendance is < 75% and has low marks', () => {
    const result = calculateRisk(70, true);
    expect(result).toEqual({
      score: 80,
      level: 'High Risk',
      reasons: ['Low Attendance (<75%)', 'Low Marks (<40%)', 'CRITICAL: Low Attendance & Low Marks']
    });
  });
});
