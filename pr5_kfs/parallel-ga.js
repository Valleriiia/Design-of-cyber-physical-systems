class ParallelGeneticAlgorithm {
    constructor(options = {}) {
        this.populationSize = options.populationSize || 100;
        this.mutationRate = options.mutationRate || 0.01;
        this.crossoverRate = options.crossoverRate || 0.9;
        this.numPopulations = options.numPopulations || 4;
        this.elitismRate = options.elitismRate || 0.1;
        this.migrationRate = options.migrationRate || 0.05;
        this.migrationInterval = options.migrationInterval || 10;
        this.cities = options.cities || [];
        this.maxIterations = options.maxIterations || 1000;
      
        this.currentIteration = 0;
        this.bestFitness = Infinity;
        this.bestRoute = null;
        this.statistics = [];
      
        this.populations = [];
      
        this.onIterationComplete = options.onIterationComplete || (() => {});
        this.onAlgorithmComplete = options.onAlgorithmComplete || (() => {});
    }
    
    // Крок 1:  Ініціалізація популяції
    initializePopulations() {
    this.populations = [];
        for (let i = 0; i < this.numPopulations; i++) {
            const population = [];
            for (let j = 0; j < this.populationSize; j++) {
                population.push(this.createRandomIndividual());
            }
            this.populations.push(population);
        }
      
        for (let i = 0; i < this.numPopulations; i++) {
            this.evaluatePopulation(this.populations[i]);
        }
      
        return this.populations;
    }
    
    createRandomIndividual() {
        const individual = [...Array(this.cities.length).keys()];
        for (let i = individual.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [individual[i], individual[j]] = [individual[j], individual[i]];
        }
        return { chromosome: individual, fitness: Infinity };
    }
  
    // Крок 2: Оцінка придатності
    evaluatePopulation(population) {
        for (let i = 0; i < population.length; i++) {
            population[i].fitness = this.calculateFitness(population[i].chromosome);
        }
        population.sort((a, b) => a.fitness - b.fitness);
    }
    
    calculateFitness(chromosome) {
        let totalDistance = 0;
        const numCities = chromosome.length;
      
        for (let i = 0; i < numCities; i++) {
            const currentCity = this.cities[chromosome[i]];
            const nextCity = this.cities[chromosome[(i + 1) % numCities]];
        
            const dx = currentCity.x - nextCity.x;
            const dy = currentCity.y - nextCity.y;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
      
        return totalDistance;
    }
  
    // Крок 3:  Вибір батьків
    selectParents(population) {
        return this.tournamentSelection(population);
    }
    
    tournamentSelection(population) {
        const tournamentSize = 3;
        const selected = [];
      
        for (let i = 0; i < population.length; i++) {
            const tournament = [];
            const indices = new Set();
        
            while (indices.size < tournamentSize) {
                const idx = Math.floor(Math.random() * population.length);
                indices.add(idx);
            }
        
            indices.forEach(idx => tournament.push(population[idx]));
        
            tournament.sort((a, b) => a.fitness - b.fitness);
            selected.push(tournament[0]);
        }
      
        return selected;
    }
  
    // Крок 4: Створення нащадків
    createOffspring(parents) {
        const offspring = [];
      
        const eliteCount = Math.floor(this.populationSize * this.elitismRate);
        for (let i = 0; i < eliteCount; i++) {
            offspring.push(JSON.parse(JSON.stringify(parents[i])));
        }
      
        while (offspring.length < this.populationSize) {
            const parent1 = parents[Math.floor(Math.random() * parents.length)];
            const parent2 = parents[Math.floor(Math.random() * parents.length)];
        
            let child;
            if (Math.random() < this.crossoverRate) {
                child = this.orderCrossover(parent1.chromosome, parent2.chromosome);
            } else {
                child = [...parent1.chromosome];
            }
        
            if (Math.random() < this.mutationRate) {
                this.mutate(child);
            }
        
            offspring.push({ chromosome: child, fitness: Infinity });
        }
      
        return offspring;
    }
    
    // Кросовер
    orderCrossover(parent1, parent2) {
        const size = parent1.length;
      
        const start = Math.floor(Math.random() * size - 0.1);
        const end = start + Math.floor(Math.random() * (size - start + 1 - 0.1));
      
        const offspring = Array(size).fill(null);
        for (let i = start; i <= end && i < size; i++) {
            offspring[i] = parent1[i];
        }
      
        let parent2Pos = 0;
        for (let i = 0; i < size; i++) {
            if (i >= start && i <= end) continue;
        
            while (offspring.includes(parent2[parent2Pos])) {
                parent2Pos++;
                if (parent2Pos >= size) parent2Pos = 0;
            }
        
            offspring[i] = parent2[parent2Pos];
            parent2Pos++;
            if (parent2Pos >= size) parent2Pos = 0;
        }
      
        return offspring;
    }
    
    // Мутація
    mutate(chromosome) {
        const pos1 = Math.floor(Math.random() * chromosome.length);
        const pos2 = Math.floor(Math.random() * chromosome.length);
      
        [chromosome[pos1], chromosome[pos2]] = [chromosome[pos2], chromosome[pos1]];
      
        return chromosome;
    }
  
    // Крок 5 & 6: Оцінка придатності нової популяції та вибір для наступної популяції
    evolvePopulation(populationIndex) {
        const population = this.populations[populationIndex];
      
        // Select parents
        const parents = this.selectParents(population);
      
        // Create offspring
        const offspring = this.createOffspring(parents);
      
        // Evaluate offspring
        this.evaluatePopulation(offspring);
      
        // Replace old population with new one
        this.populations[populationIndex] = offspring;
      
        return offspring;
    }
    
    performMigration() {
        if (this.populations.length <= 1) return;
      
        const migrationCount = Math.floor(this.populationSize * this.migrationRate);
      
        for (let i = 0; i < this.populations.length; i++) {
            const sourcePopulation = this.populations[i];
            const targetPopulation = this.populations[(i + 1) % this.populations.length];
        
            const migrants = sourcePopulation.slice(0, migrationCount).map(ind => 
                JSON.parse(JSON.stringify(ind))
            );
        
            for (let j = 0; j < migrants.length; j++) {
                targetPopulation[targetPopulation.length - j - 1] = migrants[j];
            }
        
            this.evaluatePopulation(targetPopulation);
        }
    }
  
    // Крок 7: Умова зупинки
    isTerminationConditionMet() {
        if (this.maxIterations !== 'until_last_survivor' && 
            this.currentIteration >= this.maxIterations) {
            return true;
        }
      
        if (this.maxIterations === 'until_last_survivor') {
            // Get best individual from each population
            const bestIndividuals = this.populations.map(pop => pop[0]);
        
            const firstFitness = bestIndividuals[0].fitness;
            const allSame = bestIndividuals.every(ind => 
                Math.abs(ind.fitness - firstFitness) < 0.0001
            );
        
            if (allSame && this.currentIteration > 50) {
                return true;
            }
        }
      
        return false;
    }
  
    // Крок 8: Вивід результатів 
    getBestResult() {
        let bestIndividual = null;
        let bestFitness = Infinity;
      
        for (const population of this.populations) {
            const best = population[0]; 
            if (best.fitness < bestFitness) {
                bestFitness = best.fitness;
                bestIndividual = best;
            }
        }
      
        return bestIndividual;
    }
    
    collectStatistics() {
        const stats = {
            iteration: this.currentIteration,
            populations: [],
            globalBest: {
                fitness: this.bestFitness,
                route: this.bestRoute
            }
        };
      
        for (let i = 0; i < this.populations.length; i++) {
            const population = this.populations[i];
            const bestFitness = population[0].fitness;
            const avgFitness = population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length;
        
            stats.populations.push({
                id: i,
                bestFitness,
                avgFitness,
                diversity: this.calculateDiversity(population)
            });
        }
      
        this.statistics.push(stats);
        return stats;
    }
    
    calculateDiversity(population) {
        if (population.length <= 1) return 0;
      
        let totalDifferences = 0;
        const sampleSize = Math.min(10, population.length); 
      
        for (let i = 0; i < sampleSize; i++) {
            for (let j = i + 1; j < sampleSize; j++) {
                totalDifferences += this.calculateChromosomeDifference(
                    population[i].chromosome, 
                    population[j].chromosome
                );
            }
        }
      
        const pairs = (sampleSize * (sampleSize - 1)) / 2;
        return totalDifferences / pairs;
    }
    
    calculateChromosomeDifference(chrom1, chrom2) {
        let differences = 0;
        for (let i = 0; i < chrom1.length; i++) {
            if (chrom1[i] !== chrom2[i]) {
                differences++;
            }
        }
        return differences / chrom1.length; 
    }
  
    async run() {
        this.initializePopulations();
        this.currentIteration = 0;
      
        this.bestFitness = Infinity;
        this.bestRoute = null;
        this.statistics = [];
      
        for (const population of this.populations) {
            if (population[0].fitness < this.bestFitness) {
                this.bestFitness = population[0].fitness;
                this.bestRoute = [...population[0].chromosome];
            }
        }
      
        this.collectStatistics();
      
        while (!this.isTerminationConditionMet()) {
            const evolutionPromises = [];
            for (let i = 0; i < this.populations.length; i++) {
                evolutionPromises.push(
                    new Promise(resolve => {
                        const result = this.evolvePopulation(i);
                        resolve(result);
                    })
                );
            }
        
            await Promise.all(evolutionPromises);
        
            if (this.currentIteration % this.migrationInterval === 0) {
                this.performMigration();
            }
        
            for (const population of this.populations) {
                if (population[0].fitness < this.bestFitness) {
                    this.bestFitness = population[0].fitness;
                    this.bestRoute = [...population[0].chromosome];
                }
            }
        
            const stats = this.collectStatistics();
        
            this.currentIteration++;
        
            this.onIterationComplete(stats);
        
            await new Promise(resolve => setTimeout(resolve, 0));
        }
      
        const finalResult = this.getBestResult();
        this.onAlgorithmComplete(finalResult);
      
        return finalResult;
    }
}

if (typeof module !== 'undefined') {
    module.exports = { ParallelGeneticAlgorithm };
}