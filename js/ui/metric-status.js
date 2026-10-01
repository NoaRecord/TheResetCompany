export function getMetricStatus(name, value, thresholds) {
  if (name === 'satisfaction') {
    if (value >= thresholds.normalMin) return 'NORMAL';
    if (value >= thresholds.cautionMin) return 'CAUTION';
    if (value >= thresholds.warningMin) return 'WARNING';
    return 'CRITICAL';
  }
  if (value >= thresholds.criticalMin) return 'CRITICAL';
  if (value >= thresholds.warningMin) return 'WARNING';
  if (value >= thresholds.cautionMin) return 'CAUTION';
  return 'NORMAL';
}

export function getMetricMarkers(name, thresholds) {
  if (name === 'satisfaction') return [
    { value: thresholds.warningMin, label: 'WARN' },
    { value: thresholds.cautionMin, label: 'CAUTION' },
    { value: thresholds.normalMin, label: 'NORMAL' }
  ];
  return [
    { value: thresholds.cautionMin, label: 'CAUTION' },
    { value: thresholds.warningMin, label: 'WARNING' },
    { value: thresholds.criticalMin, label: 'CRITICAL' }
  ];
}
