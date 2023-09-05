"use strict"; // Machine_Learning

class Activation {
    static softmax = {
        forward(input_array) {
            let exp_values = new Array(input_array.length)
            let exp_sum = 0;
            for (let i = 0; i < input_array.length; ++i) {
                let exp_value = Math.exp(input_array[i]);
                exp_sum += exp_value;
                exp_values[i] = exp_value;
            }
            let normalized_values = new Array(exp_values.length)
            for (let i = 0; i < input_array.length; ++i) {
                normalized_values[i] = exp_values[i] / exp_sum;
            }
            return normalized_values
        },
        backward(x) {
            return x * x
        }
    }
    static linear = {
        gradient: 1,
        forward(x) {
            return Activation.linear.gradient * x;
        },
        backward(y) {
            return Activation.linear.gradient;
        }
    }
    static sigmoid = {
        forward(x) {
            return 1 / (1 + Math.exp(-x));
        },
        backward(y) {
            return y * (1 - y)
        },
    }
    static tanh = {
        forward(x) {
            return Math.tanh(x);
        },
        backward(y) {
            return 1 - y * y
        },
    }
    static reLU = {
        forward(x) {
            return Math.max(0, x);
        },
        backward(x) {
            if (x >= 0) return 1
            return 0;
        }
    }
    static leakyReLU = {
        forward(x) {
            return Math.max(0.01 * x, x);
        },
        backward(x) {
            if (x >= 0) return 1
            return 0.01;
        }
    }
    static ELU = {
        gradient: 0.01,
        forward(x) {
            if (x >= 0) {
                return x;
            } else {
                return Activation.ELU.gradient * (Math.exp(x) - 1)
            }
        },
        backward(x) {
            if (x >= 0) return 1
            return x + Activation.ELU.gradient;
        }
    }
    static nameMap = (activationName) => {
        if (typeof activationName != "string") return activationName;
        return Activation.stringMap[activationName]
    }
    static stringMap = {
        "softmax": Activation.softmax,
        "linear": Activation.linear,
        "sigmoid": Activation.sigmoid,
        "tanh": Activation.tanh,
        "reLU": Activation.reLU,
        "leakyReLU": Activation.leakyReLU,
        "ELU": Activation.ELU,
    }
}

class Perceptron {
    constructor(amountOfImputs = 2) {
        this.weights = new Array(amountOfImputs)
        this.learning_rate = 0.1
        this.bias = 1
        this.Activation = "sigmoid"

        for (let i = 0; i < this.weights.length; ++i) {
            this.weights[i] = randomNumber(-1, 1, true)
        }
    }
    predict(inputs) {
        let sum = 0;
        for (let i = 0; i < this.weights.length; ++i) {
            sum += inputs[i] * this.weights[i];
        }
        let output = sum + this.bias;
        return Activation.nameMap(this.Activation)(output)
    }
    predictY(x) {
        let w0 = this.weights[0]
        let w1 = this.weights[1]
        return -(this.bias / w1) - (w0 / w1) * x;
    }
    train(inputs, target) {
        let guess = this.guess(inputs);
        let error = target - guess;
        for (let i = 0; i < this.weights.length; ++i) {
            this.weights[i] += (error * inputs[i]) * this.learning_rate;
        }
    }
}

class NeuralNetwork {
    constructor(input_nodes, hidden_nodes, output_nodes) {
        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;
        this.dampenOutputGradients = false;
        this.hidden_layers = new Array();
        this.output_layer;

        if (hidden_nodes instanceof Array) {
            let previous_layer_nodes = input_nodes
            for (let i = 0; i < hidden_nodes.length; ++i) {
                let hidden_layer_nodes = hidden_nodes[i];
                let new_hidden_layer = new NeuralNetwork.layer_dense(previous_layer_nodes, hidden_layer_nodes)
                this.hidden_layers.push(new_hidden_layer)
                previous_layer_nodes = hidden_layer_nodes
            }
            this.output_layer = new NeuralNetwork.layer_dense(this.hidden_nodes[this.hidden_nodes.length - 1], this.output_nodes)
        } else {
            this.hidden_layers.push(
                new NeuralNetwork.layer_dense(input_nodes, hidden_nodes)
            )
            this.output_layer = new NeuralNetwork.layer_dense(this.hidden_nodes, this.output_nodes)
        }

        this.learning_rate = 0.1;
    }

    setHiddenLayerActivationFunction(activation) {
        for (let layer of this.hidden_layers) {
            layer.Activation = activation;
        }
    }

    static layer_dense = class {
        constructor(input_nodes, layer_nodes) {
            this.input_nodes = input_nodes;
            this.layer_nodes = layer_nodes

            // each row of the weight matrix is respoinsible for a single newron, and each value of that row (array) is a weight connectiong the inputs or neurons form the previous layer to this layer
            this.weights = new Matrix(this.layer_nodes, this.input_nodes);
            this.weights.randomize(-1, 1)
            this.biases = new Matrix(this.layer_nodes, 1);
            this.biases.randomize(-1, 1);

            this.Activation = "sigmoid";
            this.inputs;
            this.outputs;
            this.errors;
        }
        getCopy() {
            return NeuralNetwork.layer_dense.deserialize(this.serialize());
        }
        serialize() {
            return JSON.stringify(this);
        }
        static deserialize(data) {
            if (typeof data == 'string') {
                data = JSON.parse(data);
            }
            let layer = new NeuralNetwork.layer_dense(data.input_nodes, data.layer_nodes)
            layer.weights = Matrix.deserialize(data.weights)
            layer.biases = Matrix.deserialize(data.biases)
            layer.network = data.network
            layer.inputs = data.inputs
            layer.outputs = data.outputs
            layer.errors = data.errors
            layer.Activation = data.Activation
            return layer
        }
        forward(inputs) {
            if (!(inputs instanceof Matrix)) {
                inputs = Matrix.createFromArray(inputs);
            }

            // the inputs multiplied by the weights
            this.outputs = Matrix.multiply(this.weights, inputs);
            // then we add the biases
            this.outputs = Matrix.add(this.outputs, this.biases)

            let activation = Activation.nameMap(this.Activation)
            // finally our activation function
            if (this.Activation == "softmax") {
                for (let i = 0; i < this.outputs.data.length; ++i) {
                    let values = this.outputs.toArray(Matrix.rowWise)
                    let softValues = activation.forward(values)
                    this.outputs = Matrix.createFromArray(softValues, Matrix.rowWise)
                }
            } else {
                this.outputs.map(activation.forward)
            }
            this.inputs = inputs;
            return this.outputs.toArray(Matrix.rowWise);
        }
        backward(next_layer_errors, previous_layer, learning_rate = 0.1) {
            let outputs = this.outputs;
            let inputs = this.inputs;

            let activation = Activation.nameMap(this.Activation)
            // calculate the error
            let weights_T = Matrix.transpose(previous_layer.weights);
            let layer_errors = Matrix.multiply(weights_T, next_layer_errors)
            this.errors = layer_errors


            // calculate the gradient
            let gradients = Matrix.map(outputs, activation.backward);
            gradients.multiply(layer_errors);
            gradients.multiply(learning_rate)

            // update the weights and biases
            let inputs_T = Matrix.transpose(inputs);
            let weight_deltas = Matrix.multiply(gradients, inputs_T)
            this.weights.add(weight_deltas)
            this.biases.add(gradients)

            return layer_errors
        }
    }

    predict(input) {
        if (!(input instanceof Matrix)) {
            input = Matrix.createFromArray(input);
        }

        let first_layer = this.hidden_layers[0]
        first_layer.forward(input)
        let last_layer_output = first_layer.outputs

        for (let l = 1; l < this.hidden_layers.length; ++l) {
            let layer = this.hidden_layers[l]
            layer.forward(last_layer_output)
            last_layer_output = layer.outputs
        }
        return this.output_layer.forward(last_layer_output)
    }

    train(input_array, targets_array) {
        let inputs = null
        if (!(input_array instanceof Matrix)) {
            inputs = Matrix.createFromArray(input_array);
        } else {
            inputs = input_array
        }

        this.predict(inputs);
        // targets
        let targets = Matrix.createFromArray(targets_array);
        // error is really just 'answer - guess'
        let output_errors = Matrix.subtract(targets, this.output_layer.outputs)

        // catergorical cross entophy
        /* let max = -Infinity
        output_errors.map((value) => {
            if(value > max){
                max = value
            }
        })
        output_errors.map((value) => {
            if(value == max){
                return -Math.log(value)
            }
            return 0
        }) */
        output_errors.map((value) => {
            return value ** 2
        })

        // calculate gradients
        let output_Activation = Activation.nameMap(this.output_layer.Activation)
        let gradients = Matrix.map(this.output_layer.outputs, output_Activation.backward)
        gradients.multiply(output_errors)
        if (this.dampenOutputGradients) {
            gradients.multiply(this.learning_rate * 0.01)
        } else {
            gradients.multiply(this.learning_rate)
        }

        // calculate deltas
        let hidden_T = Matrix.transpose(this.hidden_layers[this.hidden_layers.length - 1].outputs);
        let weight_ho_deltas = Matrix.multiply(gradients, hidden_T)
        // adjust the weights by deltas
        this.output_layer.weights.add(weight_ho_deltas)
        // adjust the biases by deltas (which is just the gradients);
        this.output_layer.biases.add(gradients);

        // output_errors.print()


        // let last_layer_errors = this.output_layer.backward(output_errors)
        // console.log("LAST ERROS")
        // last_layer_errors.print();
        let last_layer = this.output_layer
        let last_errors = output_errors;
        for (let i = this.hidden_layers.length - 1; i >= 0; --i) {
            let layer = this.hidden_layers[i]
            last_errors = layer.backward(last_errors, last_layer, this.learning_rate)
            last_layer = layer
            last_errors = layer.errors
        }

    }

    trainInBactch(inputs_batch, targets_batch) {

        let output_errors = new Matrix(this.output_layer.layer_nodes, 1)

        for (let i = 0; i < inputs_batch.length; ++i) {
            let inputs = inputs_batch[i]
            if (!(inputs instanceof Matrix)) {
                inputs = Matrix.createFromArray(inputs);
            } else {
                inputs = inputs_batch.data[i]
            }

            this.predict(inputs);
            // targets
            let targets = Matrix.createFromArray(targets_batch[i]);
            // error is really just 'answer - guess'
            output_errors.add(Matrix.subtract(targets, this.output_layer.outputs))
        }

        // I DON'T KNOW WHY, PERHAPS COS THE ERRORS ARE MUCH BIGGER, BUT IT SEEMS LKE THE NEURAL NET 
        // LERNS FASTER IF WE LEAVE THE ERRORS AS JUST A SUM, NOT THE AVERAGE
        // convert to average Error
        /*     output_errors.map((value) => {
                return value / inputs_batch.length
            }) */


        // square it?
        output_errors.map((value) => {
            return value
        })

        // calculate gradients
        let output_Activation = Activation.nameMap(this.output_layer.Activation)
        let gradients = Matrix.map(this.output_layer.outputs, output_Activation.backward)
        gradients.multiply(output_errors)
        gradients.multiply(this.learning_rate)

        // calculate deltas
        let hidden_T = Matrix.transpose(this.hidden_layers[this.hidden_layers.length - 1].outputs);
        let weight_ho_deltas = Matrix.multiply(gradients, hidden_T)
        // adjust the weights by deltas
        this.output_layer.weights.add(weight_ho_deltas)
        // adjust the biases by deltas (which is just the gradients);
        this.output_layer.biases.add(gradients);

        // output_errors.print()


        // let last_layer_errors = this.output_layer.backward(output_errors)
        // console.log("LAST ERROS")
        // last_layer_errors.print();
        let last_layer = this.output_layer
        let last_errors = output_errors;
        for (let i = this.hidden_layers.length - 1; i >= 0; --i) {
            let layer = this.hidden_layers[i]
            last_errors = layer.backward(last_errors, last_layer, this.learning_rate)
            last_layer = layer
            last_errors = layer.errors
        }
    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        if (typeof data == 'string') {
            data = JSON.parse(data);
        }
        let nn = new NeuralNetwork(data.input_nodes, data.hidden_nodes, data.output_nodes);
        nn.output_layer = NeuralNetwork.layer_dense.deserialize(data.output_layer)
        for (let i = 0; i < data.hidden_layers.length; ++i) {
            let hidden_layer = data.hidden_layers[i];
            nn.hidden_layers[i] = NeuralNetwork.layer_dense.deserialize(hidden_layer)
        }
        nn.learning_rate = data.learning_rate
        return nn;
    }

    getCopy() {
        return NeuralNetwork.deserialize(this.serialize());
    }

    copy(nn) {
        if (nn instanceof NeuralNetwork) {
            this.input_nodes = nn.input_nodes;
            this.hidden_nodes = nn.hidden_nodes;
            this.output_nodes = nn.output_nodes;

            this.learning_rate = nn.learning_rate

            this.output_layer = nn.output_layer.getCopy();
            this.hidden_layers.length = 0;
            for (let hidden_layer of nn.hidden_layers) {
                this.hidden_layers.push(hidden_layer.getCopy())
            }
        }
    }

    // Accept an arbitrary function for mutation
    mutate(rate, degree, reset = false) {
        function mutation(value) {
            if (randomNumber(0, 1, true) <= rate * 0.01) {
                if (reset) {
                    return randomNumber(-degree, degree);
                }
                return value + randomNumber(-degree, degree);
            } else {
                return value;
            }
        }
        this.output_layer.weights.map(mutation)
        this.output_layer.biases.map(mutation)
        for (let layer of this.hidden_layers) {
            layer.weights.map(mutation)
            layer.biases.map(mutation)
        }
    }
}

class nNeuralNetwork {
    constructor(input_nodes, hidden_nodes, output_nodes) {
        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;
        this.dampenOutputGradients = false;
        this.hidden_layers = new Array();
        this.output_layer;

        if (hidden_nodes instanceof Array) {
            let previous_layer_nodes = input_nodes
            for (let i = 0; i < hidden_nodes.length; ++i) {
                let hidden_layer_nodes = hidden_nodes[i];
                let new_hidden_layer = new NeuralNetwork.layer_dense(previous_layer_nodes, hidden_layer_nodes)
                this.hidden_layers.push(new_hidden_layer)
                previous_layer_nodes = hidden_layer_nodes
            }
            this.output_layer = new NeuralNetwork.layer_dense(this.hidden_nodes[this.hidden_nodes.length - 1], this.output_nodes)
        } else {
            this.hidden_layers.push(
                new NeuralNetwork.layer_dense(input_nodes, hidden_nodes)
            )
            this.output_layer = new NeuralNetwork.layer_dense(this.hidden_nodes, this.output_nodes)
        }

        this.learning_rate = 0.1;
    }

    setHiddenLayerActivationFunction(activation) {
        for (let layer of this.hidden_layers) {
            layer.Activation = activation;
        }
    }

    static layer_dense = class {
        constructor(input_nodes, layer_nodes) {
            this.input_nodes = input_nodes;
            this.layer_nodes = layer_nodes

            // each row of the weight matrix is respoinsible for a single newron, and each value of that row (array) is a weight connectiong the inputs or neurons form the previous layer to this layer
            this.weights = new Matrix(this.layer_nodes, this.input_nodes);
            this.weights.randomize(-1, 1)
            this.biases = new Matrix(this.layer_nodes, 1);
            this.biases.randomize(-1, 1);

            this.Activation = "sigmoid";
            this.inputs;
            this.outputs;
            this.errors;
        }
        getCopy() {
            return NeuralNetwork.layer_dense.deserialize(this.serialize());
        }
        serialize() {
            return JSON.stringify(this);
        }
        static deserialize(data) {
            if (typeof data == 'string') {
                data = JSON.parse(data);
            }
            let layer = new NeuralNetwork.layer_dense(data.input_nodes, data.layer_nodes)
            layer.weights = Matrix.deserialize(data.weights)
            layer.biases = Matrix.deserialize(data.biases)
            layer.network = data.network
            layer.inputs = data.inputs
            layer.outputs = data.outputs
            layer.errors = data.errors
            layer.Activation = data.Activation
            return layer
        }
        forward(inputs) {
            if (!(inputs instanceof Matrix)) {
                inputs = Matrix.createFromArray(inputs);
            }

            // the inputs multiplied by the weights
            this.outputs = Matrix.multiply(this.weights, inputs);
            // then we add the biases
            this.outputs = Matrix.add(this.outputs, this.biases)

            let activation = Activation.nameMap(this.Activation)
            // finally our activation function
            this.outputs.map(activation.forward)
            this.inputs = inputs;
            return this.outputs.toArray(Matrix.rowWise);
        }
        backward(next_layer_errors, previous_layer, learning_rate = 0.1) {
            let outputs = this.outputs;
            let inputs = this.inputs;

            let activation = Activation.nameMap(this.Activation)
            // calculate the error
            let weights_T = Matrix.transpose(previous_layer.weights);
            let layer_errors = Matrix.multiply(weights_T, next_layer_errors)
            this.errors = layer_errors


            // calculate the gradient
            let gradients = Matrix.map(outputs, activation.backward);
            gradients.multiply(layer_errors);
            gradients.multiply(learning_rate)

            // update the weights and biases
            let inputs_T = Matrix.transpose(inputs);
            let weight_deltas = Matrix.multiply(gradients, inputs_T)
            this.weights.add(weight_deltas)
            this.biases.add(gradients)

            return layer_errors
        }
    }

    predict(input) {
        if (!(input instanceof Matrix)) {
            input = Matrix.createFromArray(input);
        }

        let first_layer = this.hidden_layers[0]
        first_layer.forward(input)
        let last_layer_output = first_layer.outputs

        for (let l = 1; l < this.hidden_layers.length; ++l) {
            let layer = this.hidden_layers[l]
            layer.forward(last_layer_output)
            last_layer_output = layer.outputs
        }
        return this.output_layer.forward(last_layer_output)
    }

    train(input_array, targets_array) {
        let inputs = null
        if (!(input_array instanceof Matrix)) {
            inputs = Matrix.createFromArray(input_array);
        } else {
            inputs = input_array
        }

        this.predict(inputs);
        // targets
        let targets = Matrix.createFromArray(targets_array);
        // error is really just 'answer - guess'
        let output_errors = Matrix.subtract(targets, this.output_layer.outputs)
        output_errors.map((value) => {
            return value
        })

        // calculate gradients
        let output_Activation = Activation.nameMap(this.output_layer.Activation)
        let gradients = Matrix.map(this.output_layer.outputs, output_Activation.backward)
        gradients.multiply(output_errors)
        if (this.dampenOutputGradients) {
            gradients.multiply(this.learning_rate * 0.01)
        } else {
            gradients.multiply(this.learning_rate)
        }

        // calculate deltas
        let hidden_T = Matrix.transpose(this.hidden_layers[this.hidden_layers.length - 1].outputs);
        let weight_ho_deltas = Matrix.multiply(gradients, hidden_T)
        // adjust the weights by deltas
        this.output_layer.weights.add(weight_ho_deltas)
        // adjust the biases by deltas (which is just the gradients);
        this.output_layer.biases.add(gradients);

        // output_errors.print()


        // let last_layer_errors = this.output_layer.backward(output_errors)
        // console.log("LAST ERROS")
        // last_layer_errors.print();
        let last_layer = this.output_layer
        let last_errors = output_errors;
        for (let i = this.hidden_layers.length - 1; i >= 0; --i) {
            let layer = this.hidden_layers[i]
            last_errors = layer.backward(last_errors, last_layer, this.learning_rate)
            last_layer = layer
            last_errors = layer.errors
        }

    }

    trainInBactch(inputs_batch, targets_batch) {

        let output_errors = new Matrix(this.output_layer.layer_nodes, 1)

        for (let i = 0; i < inputs_batch.length; ++i) {
            let inputs = inputs_batch[i]
            if (!(inputs instanceof Matrix)) {
                inputs = Matrix.createFromArray(inputs);
            } else {
                inputs = inputs_batch.data[i]
            }

            this.predict(inputs);
            // targets
            let targets = Matrix.createFromArray(targets_batch[i]);
            // error is really just 'answer - guess'
            output_errors.add(Matrix.subtract(targets, this.output_layer.outputs))
        }

        // I DON'T KNOW WHY, PERHAPS COS THE ERRORS ARE MUCH BIGGER, BUT IT SEEMS LKE THE NEURAL NET 
        // LERNS FASTER IF WE LEAVE THE ERRORS AS JUST A SUM, NOT THE AVERAGE
        // convert to average Error
        /*     output_errors.map((value) => {
                return value / inputs_batch.length
            }) */


        // square it?
        output_errors.map((value) => {
            return value
        })

        // calculate gradients
        let output_Activation = Activation.nameMap(this.output_layer.Activation)
        let gradients = Matrix.map(this.output_layer.outputs, output_Activation.backward)
        gradients.multiply(output_errors)
        gradients.multiply(this.learning_rate)

        // calculate deltas
        let hidden_T = Matrix.transpose(this.hidden_layers[this.hidden_layers.length - 1].outputs);
        let weight_ho_deltas = Matrix.multiply(gradients, hidden_T)
        // adjust the weights by deltas
        this.output_layer.weights.add(weight_ho_deltas)
        // adjust the biases by deltas (which is just the gradients);
        this.output_layer.biases.add(gradients);

        // output_errors.print()


        // let last_layer_errors = this.output_layer.backward(output_errors)
        // console.log("LAST ERROS")
        // last_layer_errors.print();
        let last_layer = this.output_layer
        let last_errors = output_errors;
        for (let i = this.hidden_layers.length - 1; i >= 0; --i) {
            let layer = this.hidden_layers[i]
            last_errors = layer.backward(last_errors, last_layer, this.learning_rate)
            last_layer = layer
            last_errors = layer.errors
        }
    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        if (typeof data == 'string') {
            data = JSON.parse(data);
        }
        let nn = new NeuralNetwork(data.input_nodes, data.hidden_nodes, data.output_nodes);
        nn.output_layer = NeuralNetwork.layer_dense.deserialize(data.output_layer)
        for (let i = 0; i < data.hidden_layers.length; ++i) {
            let hidden_layer = data.hidden_layers[i];
            nn.hidden_layers[i] = NeuralNetwork.layer_dense.deserialize(hidden_layer)
        }
        nn.learning_rate = data.learning_rate
        return nn;
    }

    getCopy() {
        return NeuralNetwork.deserialize(this.serialize());
    }

    copy(nn) {
        if (nn instanceof NeuralNetwork) {
            this.input_nodes = nn.input_nodes;
            this.hidden_nodes = nn.hidden_nodes;
            this.output_nodes = nn.output_nodes;

            this.learning_rate = nn.learning_rate

            this.output_layer = nn.output_layer.getCopy();
            this.hidden_layers.length = 0;
            for (let hidden_layer of nn.hidden_layers) {
                this.hidden_layers.push(hidden_layer.getCopy())
            }
        }
    }

    // Accept an arbitrary function for mutation
    mutate(rate, degree, reset = false) {
        function mutation(value) {
            if (randomNumber(0, 1, true) <= rate * 0.01) {
                if (reset) {
                    return randomNumber(-degree, degree);
                }
                return value + randomNumber(-degree, degree);
            } else {
                return value;
            }
        }
        this.output_layer.weights.map(mutation)
        this.output_layer.biases.map(mutation)
        for (let layer of this.hidden_layers) {
            layer.weights.map(mutation)
            layer.biases.map(mutation)
        }
    }
}
