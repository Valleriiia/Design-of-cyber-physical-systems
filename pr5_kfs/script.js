document.addEventListener('DOMContentLoaded', function() {
    const numCitiesInput = document.getElementById('numCities');
    const populationSizeInput = document.getElementById('populationSize');
    const numPopulationsInput = document.getElementById('numPopulations');
    const mutationRateInput = document.getElementById('mutationRate');
    const mutationRateValue = document.getElementById('mutationRateValue');
    const crossoverRateInput = document.getElementById('crossoverRate');
    const crossoverRateValue = document.getElementById('crossoverRateValue');
    const elitismRateInput = document.getElementById('elitismRate');
    const elitismRateValue = document.getElementById('elitismRateValue');
    const migrationRateInput = document.getElementById('migrationRate');
    const migrationRateValue = document.getElementById('migrationRateValue');
    const migrationIntervalInput = document.getElementById('migrationInterval');
    const maxIterationsInput = document.getElementById('maxIterations');
    const useUntilLastSurvivorInput = document.getElementById('useUntilLastSurvivor');
    const generateCitiesBtn = document.getElementById('generateCities');
    const startAlgorithmBtn = document.getElementById('startAlgorithm');
    const pauseAlgorithmBtn = document.getElementById('pauseAlgorithm');
    const resetAlgorithmBtn = document.getElementById('resetAlgorithm');
    const currentIterationSpan = document.getElementById('currentIteration');
    const bestDistanceSpan = document.getElementById('bestDistance');
    const statsTableBody = document.getElementById('statsTableBody');
    const tspCanvas = document.getElementById('tspCanvas');
    const tspCtx = tspCanvas.getContext('2d');
            
    const fitnessChartCanvas = document.getElementById('fitnessChart');
    const diversityChartCanvas = document.getElementById('diversityChart');
            
    let fitnessChart = new Chart(fitnessChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Найкраща придатність з часом'
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
            
    let diversityChart = new Chart(diversityChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Різноманітність популяцій з часом'
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });

    let cities = [];
    let ga = null;
    let isRunning = false;
    let isPaused = false;

    mutationRateInput.addEventListener('input', function() {
        mutationRateValue.textContent = this.value;
    });
           
    crossoverRateInput.addEventListener('input', function() {
        crossoverRateValue.textContent = this.value;
    });
           
    elitismRateInput.addEventListener('input', function() {
        elitismRateValue.textContent = this.value;
    });
          
    migrationRateInput.addEventListener('input', function() {
        migrationRateValue.textContent = this.value;
    });
            
    useUntilLastSurvivorInput.addEventListener('change', function() {
        maxIterationsInput.disabled = this.checked;
    });

    generateCitiesBtn.addEventListener('click', generateRandomCities);
    startAlgorithmBtn.addEventListener('click', startOrResumeAlgorithm);
    pauseAlgorithmBtn.addEventListener('click', pauseAlgorithm);
    resetAlgorithmBtn.addEventListener('click', resetAlgorithm);

    generateRandomCities();

    function generateRandomCities() {
        const numCities = parseInt(numCitiesInput.value);
        cities = [];

        const canvasWidth = tspCanvas.width;
        const canvasHeight = tspCanvas.height;
        const padding = 20;
                
        for (let i = 0; i < numCities; i++) {
            cities.push({
                x: padding + Math.random() * (canvasWidth - 2 * padding),
                y: padding + Math.random() * (canvasHeight - 2 * padding),
                id: i
            });
        }

        drawCities();
        resetStatistics();
    }
            
    function drawCities() {

        tspCtx.clearRect(0, 0, tspCanvas.width, tspCanvas.height);

        tspCtx.fillStyle = 'blue';
        cities.forEach(city => {
            tspCtx.beginPath();
            tspCtx.arc(city.x, city.y, 5, 0, Math.PI * 2);
            tspCtx.fill();
            tspCtx.fillText(city.id, city.x + 8, city.y);
        });
    }
            
    function drawRoute(route) {

        tspCtx.strokeStyle = 'red';
        tspCtx.lineWidth = 2;
        tspCtx.beginPath();

        const firstCity = cities[route[0]];
        tspCtx.moveTo(firstCity.x, firstCity.y);

        for (let i = 1; i < route.length; i++) {
            const city = cities[route[i]];
            tspCtx.lineTo(city.x, city.y);
                }

        tspCtx.lineTo(firstCity.x, firstCity.y);
        tspCtx.stroke();
    }
            
    function resetStatistics() {
        currentIterationSpan.textContent = '0';
        bestDistanceSpan.textContent = 'N/A';
        statsTableBody.innerHTML = '';

        fitnessChart.data.labels = [];
        fitnessChart.data.datasets = [];
        fitnessChart.update();
                
        diversityChart.data.labels = [];
        diversityChart.data.datasets = [];
        diversityChart.update();
    }
            
    function startOrResumeAlgorithm() {
        if (isRunning && isPaused) {
            isPaused = false;
            startAlgorithmBtn.disabled = true;
            pauseAlgorithmBtn.disabled = false;
            return;
        }
                
        if (isRunning) return;

        const options = {
            populationSize: parseInt(populationSizeInput.value),
            mutationRate: parseFloat(mutationRateInput.value),
            crossoverRate: parseFloat(crossoverRateInput.value),
            numPopulations: parseInt(numPopulationsInput.value),
            elitismRate: parseFloat(elitismRateInput.value),
            migrationRate: parseFloat(migrationRateInput.value),
            migrationInterval: parseInt(migrationIntervalInput.value),
            cities: cities,
            maxIterations: useUntilLastSurvivorInput.checked ? 'until_last_survivor' : parseInt(maxIterationsInput.value),
            onIterationComplete: onIterationComplete,
            onAlgorithmComplete: onAlgorithmComplete
        };

        ga = new ParallelGeneticAlgorithm(options);
        isRunning = true;

        startAlgorithmBtn.disabled = true;
        pauseAlgorithmBtn.disabled = false;

        initializeCharts(options.numPopulations);

        ga.run().then(result => {
            console.log('Алгоритм завершено:', result);
        });
    }
            
    function pauseAlgorithm() {
        if (!isRunning || isPaused) return;
                
        isPaused = true;
        pauseAlgorithmBtn.disabled = true;
        startAlgorithmBtn.disabled = false;
        startAlgorithmBtn.textContent = 'Продовжити алгоритм';
    }
            
    function resetAlgorithm() {
        isRunning = false;
        isPaused = false;

        startAlgorithmBtn.disabled = false;
        pauseAlgorithmBtn.disabled = true;
        startAlgorithmBtn.textContent = 'Запустити алгоритм';

        resetStatistics();
        drawCities();
    }
            
    function initializeCharts(numPopulations) {
        const fitnessDatasets = [{
            label: 'Глобальний найкращий',
            data: [],
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 2,
            fill: false
        }];

        const colors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 0, 0, 1)',
            'rgba(0, 255, 0, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(128, 128, 128, 1)'
        ];

        for (let i = 0; i < numPopulations; i++) {
            fitnessDatasets.push({
            label: `Популяція ${i+1}`,
            data: [],
            borderColor: colors[i % colors.length],
            borderWidth: 1,
            fill: false
            });
        }
                
        fitnessChart.data.datasets = fitnessDatasets;
        fitnessChart.data.labels = [];
        fitnessChart.update();

        const diversityDatasets = [];
        for (let i = 0; i < numPopulations; i++) {
            diversityDatasets.push({
                label: `Population ${i+1}`,
                data: [],
                borderColor: colors[i % colors.length],
                borderWidth: 1,
                fill: false
            });
        }
                
        diversityChart.data.datasets = diversityDatasets;
        diversityChart.data.labels = [];
        diversityChart.update();
    }
            
    function onIterationComplete(stats) {
        if (isPaused) return;

        currentIterationSpan.textContent = stats.iteration;
        bestDistanceSpan.textContent = stats.globalBest.fitness.toFixed(2);

        drawCities();
        drawRoute(stats.globalBest.route);

        statsTableBody.innerHTML = '';
        stats.populations.forEach(pop => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pop.id + 1}</td>
                <td>${pop.bestFitness.toFixed(2)}</td>
                <td>${pop.avgFitness.toFixed(2)}</td>
                <td>${pop.diversity.toFixed(4)}</td>
            `;
            statsTableBody.appendChild(row);
        });

        updateCharts(stats);
    }
            
    function updateCharts(stats) {
        if (!fitnessChart.data.labels.includes(stats.iteration)) {
            fitnessChart.data.labels.push(stats.iteration);
            diversityChart.data.labels.push(stats.iteration);
        }

        fitnessChart.data.datasets[0].data.push(stats.globalBest.fitness);

        stats.populations.forEach((pop, index) => {
            fitnessChart.data.datasets[index + 1].data.push(pop.bestFitness);

            diversityChart.data.datasets[index].data.push(pop.diversity);
        });

        fitnessChart.update();
        diversityChart.update();
    }
            
    function onAlgorithmComplete(result) {
        isRunning = false;
                
        startAlgorithmBtn.disabled = false;
        startAlgorithmBtn.textContent = 'Запустити алгоритм';
        pauseAlgorithmBtn.disabled = true;
                
        alert(`Алгоритм завершено!\nНайкраща знайдена відстань: ${result.fitness.toFixed(2)}`);
    }
});