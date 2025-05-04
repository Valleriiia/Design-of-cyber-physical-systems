const locationSelect = document.getElementById('locationSelect');
let forecastChart, impactChart, feelDeltaChart;


fetch('../backend/get_locations.php')
  .then(res => res.json())
  .then(locations => {
    locations.forEach(loc => {
      const option = document.createElement('option');
      option.value = loc.id;
      option.textContent = `${loc.country} — ${loc.location_name}`;
      locationSelect.appendChild(option);
    });

    loadAllData(locations[0].id); 
  });

locationSelect.addEventListener('change', () => {
  const locId = locationSelect.value;
  loadAllData(locId);
});

function loadAllData(locationId) {
  loadForecast(locationId);
  loadImpact(locationId);
  loadFeel(locationId);
}

function loadForecast(locationId) {
  fetch(`../backend/forecast.php?location_id=${locationId}`)
    .then(res => res.json())
    .then(data => {
      const histLabels = data.history.map(h => h.date);
      const histData = data.history.map(h => h.wind_mph);
      const predLabels = data.forecast.map(f => f.date);
      const predData = data.forecast.map(f => f.wind_mph);
      
      const allLabels = histLabels.concat(predLabels);
      const allData = histData.concat(predData);
      const forecastStartIndex = histLabels.length;
      
      if (forecastChart) forecastChart.destroy();
      forecastChart = new Chart(document.getElementById('forecastChart'), {
        type: 'line',
        data: {
          labels: allLabels,
          datasets: [{
            label: 'Сила вітру (mph)',
            data: allData,
            borderColor: 'blue',
            backgroundColor: 'rgba(0,0,255,0.1)',
            fill: true,
            segment: {
              borderColor: ctx => ctx.p0DataIndex >= forecastStartIndex ? 'orange' : 'blue',
              backgroundColor: ctx => ctx.p0DataIndex >= forecastStartIndex ? 'rgba(255,165,0,0.2)' : 'rgba(0,0,255,0.1)'
            },
            tension: 0.3
          }]
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => {
                  const label = ctx.p0DataIndex >= forecastStartIndex ? 'Прогноз' : 'Історія';
                  return `${label}: ${ctx.raw} mph`;
                }
              }
            }
          }
        }
      });     
        
    });
}

function loadImpact(locationId) {
  fetch('../backend/impact.php?location_id=' + locationId)
    .then(r => r.json())
    .then(data => {
      const labels = data.map(d => d.date);
      const temp = data.map(d => d.temperature);
      const feels = data.map(d => d.feels_like);
      const wind = data.map(d => d.wind);

      if (impactChart) impactChart.destroy();

      impactChart = new Chart(document.getElementById('impactChart'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Температура (°C)',
              data: temp,
              borderColor: 'red',
              yAxisID: 'y',
              fill: false,
              tension: 0.3,
            },
            {
              label: 'Відчувається як (°C)',
              data: feels,
              borderColor: 'orange',
              yAxisID: 'y',
              fill: false,
              tension: 0.3,
            },
            {
              label: 'Сила вітру (mph)',
              data: wind,
              borderColor: 'blue',
              borderDash: [5, 5],
              yAxisID: 'y1',
              fill: false,
              tension: 0.3,
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: {
              display: true,
              text: 'Вплив вітру на температуру (останні 60 днів)'
            }
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Температура (°C)' }
            },
            y1: {
              type: 'linear',
              position: 'right',
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Вітер (mph)' }
            }
          }
        }
      });
    })
    .catch(error => {
      console.error('Помилка завантаження графіка впливу:', error);
    });
}

function loadFeel(locationId) {
    fetch('../backend/feel_delta.php?location_id=' + locationId)
    .then(r => r.json())
    .then(data => {
      const labels = data.map(d => d.date);
      const values = data.map(d => d.delta);
      const colors = values.map(delta => {
        if (delta > 2) return 'orange';
        else if (delta < -2) return 'skyblue';
        else return 'gray';
      });

      if (feelDeltaChart) feelDeltaChart.destroy();

      feelDeltaChart = new Chart(document.getElementById('feelDeltaChart'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Відхилення від реальної температури (°C)',
            data: values,
            backgroundColor: colors,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Наскільки температура відчувалась інакше (останні 60 днів)'
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  const val = ctx.parsed.y;
                  if (val > 2) return ` Відчувалась теплішою на ${val}°`;
                  if (val < -2) return ` Відчувалась холоднішою на ${Math.abs(val)}°`;
                  return ` Майже відповідала реальній (${val}°)`;
                }
              }
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Різниця (°C)'
              }
            }
          }
        }
      });
    });

}
