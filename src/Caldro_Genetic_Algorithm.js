"use strict" // Genetic_Algorithms

class geneticInformation {
    constructor(score, fitness, brain) {
        this.score = score;
        this.fitness = fitness;
        this.brain = brain;
        this.ID = generateRandomId();
        this.isBestAgent = false;
        this.bestAgentGenes = 0;
        this.rank = "unDetermined";
    }
    addToScore(value){
        this.score += value;
    }
}

class NeuroEvolution {
    constructor(initialNeuralNetworkModel, populationSize = 100) {
        this.populationSize = populationSize;
        this.generation = 1;
        if(initialNeuralNetworkModel instanceof Array){
            initialNeuralNetworkModel = new NeuralNetwork(initialNeuralNetworkModel[0], initialNeuralNetworkModel[1], initialNeuralNetworkModel[2])
            initialNeuralNetworkModel.setHiddenLayerActivationFunction("leakyReLU")
            initialNeuralNetworkModel.output_layer.Activation = "linear"
        }
        this.initialNeuralNetworkModel = initialNeuralNetworkModel;

        this.crossover = true

        this.mutation = true;
        this.mutationRate = 1;
        this.mutationDegree = 1;
        this.isResetMutation = false;

        this.agentName = "auto"
        this.logGenInfoToConsole = true;

        this.generationalData = new Array();
        this.recordGenerationData = true;

        this.updateRanks = true
        this.currentGenerationBestAgent = null;
        this.currentGenerationWorstAgent = null;
    }

    init(agents, exactCopyOfInitialBrain = false) {
        for (let agent of agents) {
            let simlarBrain = this.initialNeuralNetworkModel.getCopy()
            if(!exactCopyOfInitialBrain){
                simlarBrain.mutate(100, 1, true);
            }
            agent.geneticInformation = new geneticInformation(0, 0, simlarBrain)
        }
    }

    updateCurrentGanerationData(agents) {
        let fitnessSum = 0;
        let scoreSum = 0;
        let bestAgent = null
        let worstAgent = null
        for (let agent of agents) {
            agent.geneticInformation.fitness = this.scoreToFitnessMapping(agent.geneticInformation.score)
            fitnessSum += agent.geneticInformation.fitness;
            scoreSum += agent.geneticInformation.score;
            agent.geneticInformation.isBestAgent = false
            if (bestAgent == null) {
                bestAgent = agent
            } else {
                if (agent.geneticInformation.fitness > bestAgent.geneticInformation.fitness) {
                    bestAgent = agent
                }
            }
            if (worstAgent == null) {
                worstAgent = agent
            } else {
                if (agent.geneticInformation.fitness < worstAgent.geneticInformation.fitness) {
                    worstAgent = agent
                }
            }
        }
        bestAgent.geneticInformation.isBestAgent = true
        this.currentGenerationBestAgent = bestAgent
        this.currentGenerationWorstAgent = worstAgent

        // console.log(bestAgent.geneticInformation.fitness)
        return {
            fitnessSum: fitnessSum,
            scoreSum: scoreSum,
            bestAgent: bestAgent,
            worstAgent: worstAgent,
        }
    }

    nextGeneration(agents, autoUpdate = false) {
        if (this.populationSize != agents.length) {
            console.error("Genetic Algorithm Error: amount of agents passed to 'NeuroEvolution.nextGeneration' does not match NeuroEvolution.populationSize. Consider checking ths 'agents' array passed or update NeuroEvolution.populationSize")
            return;
        }
        // let oldIB =agents[0].geneticInformation.ID
        let fitnessInfo = this.calculateFitness(agents);
        // console.log("resorted:", oldIB == agents[0].geneticInformation.ID)
        let bestAgentAsParent = 0
        let bestAgentAsSingleParent = 0


        let newGenetics = new Array();
        for (let i = 0; i < this.populationSize; ++i) {
            // yo let's some secret agents to mate and produce a baby secret agent....muahahahaha
            let agent_parent1 = NeuroEvolution.selectAgent(agents)
            let agent_parent2 = NeuroEvolution.selectAgent(agents)
            let newBrain;

            // some weird genetic stuffs going on here...NEAY huh...

            // crossover or no crossover?
            if (this.crossover || (agent_parent1.geneticInformation.ID != agent_parent2.geneticInformation.ID)) {
                newBrain = NeuroEvolution.crossOver(agent_parent1, agent_parent2,
                    100 * (agent_parent1.geneticInformation.fitness / (agent_parent1.geneticInformation.fitness + agent_parent2.geneticInformation.fitness)))
            } else {
                if (chance(100 * (agent_parent1.geneticInformation.fitness / (agent_parent1.geneticInformation.fitness + agent_parent2.geneticInformation.fitness)))) {
                    newBrain = agent_parent1.geneticInformation.brain.getCopy()
                } else {
                    newBrain = agent_parent2.geneticInformation.brain.getCopy()
                }
            }

            // mutation? probably should
            if (this.mutation) {
                newBrain.mutate(this.mutationRate, this.mutationDegree, this.isResetMutation);
            }
            // newBrain.setHiddenLayerActivationFunction(Activation.leakyReLU)
            // newBrain.output_layer.Activation = Activation.linear

            let genetics = new geneticInformation(0, 0, newBrain)

            genetics.bestAgentGenes = (agent_parent1.geneticInformation.ID == fitnessInfo.bestAgent.geneticInformation.ID) + (agent_parent2.geneticInformation.ID == fitnessInfo.bestAgent.geneticInformation.ID)
            // feeling like a mad scientist...? Y'know...merging brains and all...
            if (genetics.bestAgentGenes == 1) {
                bestAgentAsParent++
            } else if (genetics.bestAgentGenes == 2) {
                bestAgentAsSingleParent++
            }

            newGenetics.push(genetics)
            if (autoUpdate) {
                agents[i].geneticInformation = genetics
            }
        }

        // cos I'm a control freak...
        //               ...not really, hahaha..ha..mmmmMmm
        let averageFitxness = fitnessInfo.fitnessSum / agents.length;
        let averageScore = fitnessInfo.scoreSum / agents.length


        // TODO: add generation data to this.generationalData
        if (this.recordGenerationData) {
            let generationData = {
                generation: this.generation,
                populationSize: this.populationSize,
                averageFitxness: averageFitxness,
                averageScore: averageScore,
                bestAgent: fitnessInfo.bestAgent,
                worstAgent: fitnessInfo.worstAgent,
            }
            this.generationalData[this.generation] = generationData;
        }
        if (this.logGenInfoToConsole) {
            let secondDashes = "-----------"
            secondDashes = secondDashes.substring(this.generation.toString().length - 1)
            console.log("<----------- Gen: |", this.generation, "| " + secondDashes + ">")
            console.log("Average FItness:", toDecimalPlace(averageFitxness, 2))
            console.log("Average Score:", toDecimalPlace(averageScore, 2))
            let agentName;
            if (this.agentName) {
                agentName = this.agentName
                if (this.agentName == "auto") {
                    agentName = getConstructorName(agents[0])
                }
            }
            console.log("Best " + agentName + " score: ", toDecimalPlace(fitnessInfo.bestAgent.geneticInformation.score, 2))
            console.log("Worst " + agentName + " score: ", toDecimalPlace(fitnessInfo.worstAgent.geneticInformation.score, 2))
            console.log("New Agents with best Agent genes:", bestAgentAsParent, toDecimalPlace((bestAgentAsParent / agents.length) * 100, 2) + "%")
            console.log("New Agents with double best Agent genes:", bestAgentAsSingleParent, toDecimalPlace((bestAgentAsSingleParent / agents.length) * 100, 2) + "%")
        }
        ++this.generation
        return newGenetics;
    }

    scoreToFitnessMapping(score) {
        return (score) ** 3;
        // return (score*0.01) ** 3;
    }

    calculateFitness(agents) {
        let fitnessSum = 0;
        let scoreSum = 0;
        let bestAgent = null
        let worstAgent = null
        let index = 0


        for (let agent of agents) {
            if(this.updateRanks){
                agent.geneticInformation.i = index
                ++index
            }
            // calculate and setFitness Values
            agent.geneticInformation.fitness = this.scoreToFitnessMapping(agent.geneticInformation.score)
            // get fitness sum and normalize fitness
            fitnessSum += agent.geneticInformation.fitness;

            // extra stuff
            scoreSum += agent.geneticInformation.score;
            if (bestAgent == null) {
                bestAgent = agent
            } else {
                if (agent.geneticInformation.fitness > bestAgent.geneticInformation.fitness) {
                    bestAgent = agent
                }
            }
            if (worstAgent == null) {
                worstAgent = agent
            } else {
                if (agent.geneticInformation.fitness < worstAgent.geneticInformation.fitness) {
                    worstAgent = agent
                }
            }
            agent.geneticInformation.isBestAgent = false;
        }
        bestAgent.geneticInformation.isBestAgent = true;


        if (this.updateRanks) {
            let savedAgents = new Array(agents.length)
            for (let i = 0; i < agents.length; ++i) {
                savedAgents[i] = agents[i]
            }
            let sortedAgents = savedAgents.sort((agent) => {
                return -agent.geneticInformation.fitness
            })
            for (let a = 0; a < sortedAgents.length; ++a) {
                let agent = sortedAgents[a]
                agent.geneticInformation.rank = a;
                delete agent.geneticInformation.i
            }
        }


        // normalizeing the fitness...and other stuff
        arrUtils.map(agents, (agent) => {
            agent.geneticInformation.fitness = agent.geneticInformation.fitness / fitnessSum
        })
        return {
            agents: agents,
            fitnessSum: fitnessSum,
            scoreSum: scoreSum,
            bestAgent: bestAgent,
            worstAgent: worstAgent,
        }
    }

    static selectAgent(agents) {
        let index = 0;
        let picker = randomNumber(0, 1);
        let currentSum = 0;

        for (let i = 0; i < agents.length; ++i) {
            let agent = agents[i]
            currentSum += agent.geneticInformation.fitness
            if (currentSum > picker) {
                index = i
                break;
            }
        }

        let agent = agents[index]
        return agent;
    }


    static crossOver(agent1, agent2) {
        let brain1 = agent1.geneticInformation.brain;
        let brain2 = agent2.geneticInformation.brain;
        let mixBrain = new NeuralNetwork(brain1.input_nodes, brain1.hidden_nodes, brain1.output_nodes);
        let mixBrainLayers = (brain1_layer, brain2_layer, percentageChanceForLayer1 = 50) => {
            let mixLayer = brain1_layer.getCopy(); // I'm gonna change all its values anyway
            // let mixLayer = new NeuralNetwork.layer_dense(brain1_layer.input_nodes, brain1_layer.layer_nodes)
            // probabilty of gene (weight or bias) being from brain1_layer
            let prob = percentageChanceForLayer1
            mixLayer.weights.map((value, i, j) => {
                if (chance(prob)) {
                    return brain1_layer.weights.data[i][j]
                } else {
                    return brain2_layer.weights.data[i][j]
                }
            })
            mixLayer.biases.map((value, i, j) => {
                if (chance(prob)) {
                    return brain1_layer.biases.data[i][j]
                } else {
                    return brain2_layer.biases.data[i][j]
                }
            })
            return mixLayer
        }
        mixBrain.output_layer = mixBrainLayers(brain1.output_layer, brain2.output_layer)
        for (let i = 0; i < mixBrain.hidden_layers.length; ++i) {
            mixBrain.hidden_layers[i] = mixBrainLayers(brain1.hidden_layers[i], brain2.hidden_layers[i])
        }
        return mixBrain
    }
}
