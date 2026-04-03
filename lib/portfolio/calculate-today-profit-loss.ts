export type PortfolioHistoryPoint = {
  capturedAt: string;
  totalValue: number;
};

function getUtcDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function calculateTodayProfitLoss(points: PortfolioHistoryPoint[]) {
  if (points.length < 2) {
    return 0;
  }

  const orderedPoints = [...points].sort((left, right) =>
    left.capturedAt.localeCompare(right.capturedAt)
  );
  const latestPoint = orderedPoints[orderedPoints.length - 1];
  const latestDayKey = getUtcDayKey(latestPoint.capturedAt);
  const dayPoints = orderedPoints.filter((point) => getUtcDayKey(point.capturedAt) === latestDayKey);

  if (dayPoints.length < 2) {
    return 0;
  }

  return latestPoint.totalValue - dayPoints[0].totalValue;
}
