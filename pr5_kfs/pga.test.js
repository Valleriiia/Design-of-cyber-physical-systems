const { ParallelGeneticAlgorithm } = require('./parallel-ga.js');

const mockCities = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 0 }
];

describe('ParallelGeneticAlgorithm', () => {
    let ga;

    beforeEach(() => {
        ga = new ParallelGeneticAlgorithm({
            cities: mockCities,
            populationSize: 10,
            numPopulations: 1,
            mutationRate: 1,
            crossoverRate: 1, 
            elitismRate: 0.2,
            maxIterations: 10
        });
        ga.initializePopulations();
    });

    test('Fitness evaluation returns positive number', () => {
        const chromosome = [0, 1, 2, 3];
        const fitness = ga.calculateFitness(chromosome);
        expect(typeof fitness).toBe('number');
        expect(fitness).toBeGreaterThan(0);
    });

    test('Selected parents are from population and valid', () => {
        const parents = ga.selectParents(ga.populations[0]);
        expect(parents.length).toBe(ga.populationSize);
        parents.forEach(parent => {
            expect(Array.isArray(parent.chromosome)).toBe(true);
        });
    });

    test('Offspring are created with valid chromosomes', () => {
        const parents = ga.selectParents(ga.populations[0]);
        const offspring = ga.createOffspring(parents);
        expect(offspring.length).toBe(ga.populationSize);

        offspring.forEach(child => {
            expect(new Set(child.chromosome).size).toBe(mockCities.length); 
            expect(child.chromosome.length).toBe(mockCities.length);
        });
    });

    test('New population is evaluated and sorted', () => {
        const evolved = ga.evolvePopulation(0);
        for (let i = 1; i < evolved.length; i++) {
            expect(evolved[i - 1].fitness).toBeLessThanOrEqual(evolved[i].fitness);
        }
    });

    test('getBestResult returns the fittest individual', () => {
        const best = ga.getBestResult();
        expect(best).toBeDefined();
        expect(best.fitness).toBeLessThanOrEqual(
            Math.max(...ga.populations[0].map(p => p.fitness))
        );
    });

    test('Mutation changes chromosome', () => {
        const original = [0, 1, 2, 3];
        const mutated = [...original];
        ga.mutate(mutated); 
        const differences = original.filter((val, i) => val !== mutated[i]).length;
        expect(differences).toBeGreaterThanOrEqual(2);
    });

    test('Chromosome difference returns normalized distance', () => {
        const chrom1 = [0, 1, 2, 3];
        const chrom2 = [3, 2, 1, 0];
        const diff = ga.calculateChromosomeDifference(chrom1, chrom2);
        expect(diff).toBeGreaterThan(0);
        expect(diff).toBeLessThanOrEqual(1);
    });

    test('Diversity is computed for a population', () => {
        const diversity = ga.calculateDiversity(ga.populations[0]);
        expect(typeof diversity).toBe('number');
        expect(diversity).toBeGreaterThanOrEqual(0);
    });

    test('Statistics are collected correctly', () => {
        const stats = ga.collectStatistics();
        expect(stats.iteration).toBe(0);
        expect(stats.populations.length).toBe(1);
        expect(stats.globalBest.fitness).toBeDefined();
    });
});
