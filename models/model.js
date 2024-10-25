const tf = require('@tensorflow/tfjs'); // TensorFlow.js for Node

let trainedModel = null; // Global model for reuse

// Normalize values to range [0, 1]
const normalize = (value, min, max) => (value - min) / (max - min);

// Denormalize back to original scale
const denormalize = (value, min, max) => value * (max - min) + min;

// Build a deeper TensorFlow model for better feature extraction
const buildModel = () => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [3] }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 })); // Output: Predicted sleep quality
    model.compile({
        optimizer: tf.train.adam(),
        loss: 'meanSquaredError',
        metrics: ['mae'], // Track Mean Absolute Error for better monitoring
    });
    return model;
};

// Train the model and store it for future predictions
const trainModel = async (dailyData) => {
    trainedModel = buildModel(); // Initialize the model

    const inputs = dailyData.map(day => [
        normalize(day.duration, 0, 12), // Normalize duration (0-12 hours range)
        normalize(day.activity, 0, 10), // Normalize activity level (0-10 scale)
        normalize(day.stress, 0, 10) // Normalize stress level (0-10 scale)
    ]);
    const labels = dailyData.map(day => normalize(day.quality, 0, 10)); // Normalize quality

    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    await trainedModel.fit(xs, ys, {
        epochs: 50, // Increase epochs for better training
        batchSize: 4, // Train in batches for efficiency
        verbose: 1, // Show epoch logs
        callbacks: tf.callbacks.earlyStopping({ // Stop early if no improvement
            monitor: 'loss',
            patience: 5,
        }),
    });

    xs.dispose();
    ys.dispose();
};

// Predict sleep quality using the trained model
const predict = async (input) => {
    if (!trainedModel) {
        throw new Error('Model not trained yet. Please train the model first.');
    }

    const normalizedInput = [
        normalize(input[0], 0, 12), // Normalize duration
        normalize(input[1], 0, 10), // Normalize activity
        normalize(input[2], 0, 10), // Normalize stress
    ];

    const tensorInput = tf.tensor2d([normalizedInput]);
    const prediction = trainedModel.predict(tensorInput);
    const normalizedResult = prediction.dataSync()[0];

    tensorInput.dispose();
    prediction.dispose();

    return denormalize(normalizedResult, 0, 10); // Convert prediction back to original scale
};

module.exports = { trainModel, predict };
