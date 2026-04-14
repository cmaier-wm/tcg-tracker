import Charts
import SwiftUI

struct PriceHistoryChartView: View {
    let title: String
    let points: [PricePoint]
    let emptyMessage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(title)
                .font(.headline)

            if points.count > 1 {
                Chart(points) { point in
                    LineMark(
                        x: .value("Captured At", point.capturedAt),
                        y: .value("Market Price", point.marketPrice)
                    )
                    .foregroundStyle(AppTheme.accent)
                    .lineStyle(StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
                }
                .frame(height: 180)
            } else {
                Text(emptyMessage)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(AppTheme.surface)
        )
    }
}
