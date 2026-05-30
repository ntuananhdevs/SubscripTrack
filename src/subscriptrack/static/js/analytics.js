/**
 * SubsTrack — Analytics JavaScript
 * Chart.js rendering for category pie chart and monthly trend bar chart.
 */

document.addEventListener('DOMContentLoaded', function () {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#a1a1aa' : '#71717a';
  const gridColor = isDark ? 'rgba(63, 63, 70, 0.3)' : 'rgba(228, 228, 231, 0.5)';

  // ── Pie Chart ──────────────────────────────────
  const pieCanvas = document.getElementById('categoryPieChart');
  if (pieCanvas) {
    const labels = JSON.parse(pieCanvas.dataset.labels || '[]');
    const values = JSON.parse(pieCanvas.dataset.values || '[]');
    const colors = JSON.parse(pieCanvas.dataset.colors || '[]');

    if (labels.length > 0 && values.some(v => v > 0)) {
      new Chart(pieCanvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: isDark ? '#27272a' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '62%',
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              titleColor: isDark ? '#f4f4f5' : '#18181b',
              bodyColor: isDark ? '#a1a1aa' : '#71717a',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function (ctx) {
                  const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = ((ctx.parsed / total) * 100).toFixed(1);
                  const val = ctx.parsed.toLocaleString('vi-VN');
                  return ` ${ctx.label}: ${val} VND (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  // ── Bar Chart ──────────────────────────────────
  const barCanvas = document.getElementById('trendBarChart');
  if (barCanvas) {
    const labels = JSON.parse(barCanvas.dataset.labels || '[]');
    const values = JSON.parse(barCanvas.dataset.values || '[]');

    if (labels.length > 0 && values.some(v => v > 0)) {
      new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Chi phí (VND)',
            data: values,
            backgroundColor: values.map(function (v) {
              if (v === values[values.length - 1]) {
                return isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.85)';
              }
              return isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.25)';
            }),
            borderColor: values.map(function (v, i) {
              if (i === values.length - 1) return '#6366f1';
              return isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)';
            }),
            borderWidth: function (ctx) {
              return ctx.dataIndex === ctx.dataset.data.length - 1 ? 2 : 1;
            },
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              titleColor: isDark ? '#f4f4f5' : '#18181b',
              bodyColor: isDark ? '#a1a1aa' : '#71717a',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: function (ctx) {
                  return ' ' + ctx.parsed.y.toLocaleString('vi-VN') + ' VND';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { size: 11 },
                callback: function (val) {
                  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'tr';
                  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                  return val;
                }
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                color: textColor,
                font: { size: 10 },
                maxRotation: 0,
              }
            }
          }
        }
      });
    }
  }
});