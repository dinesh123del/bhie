import { EventEmitter } from 'events';
import * as TensorFlow from '@tensorflow/tfjs-node';
import Business from '../models/Business.js';
import Record from '../models/Record.js';
import { CacheService } from './cacheService.js';

interface PredictionInput {
  businessId: string;
  historicalData: number[];
  marketConditions: number[];
  seasonality: number[];
  externalFactors: number[];
}

interface PredictionOutput {
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
  risk: number;
  confidence: number;
  timeline: number[]; // Next 12 months
}

interface NeuralNetworkConfig {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
}

export class NeuralPredictionEngine extends EventEmitter {
  private models: Map<string, TensorFlow.LayersModel> = new Map();
  private isTraining: Map<string, boolean> = new Map();
  private config: NeuralNetworkConfig;
  private globalModel: TensorFlow.LayersModel | null = null;

  constructor() {
    super();
    this.config = {
      inputSize: 50, // 50 input features
      hiddenLayers: [128, 64, 32], // Deep neural network
      outputSize: 6, // 6 prediction outputs
      learningRate: 0.001,
      epochs: 100,
      batchSize: 32
    };

    this.initializeGlobalModel();
  }

  private async initializeGlobalModel(): Promise<void> {
    try {
      this.globalModel = TensorFlow.sequential() as any;

      // Input layer
      (this.globalModel as any).add(TensorFlow.layers.dense({
        inputShape: [this.config.inputSize],
        units: this.config.hiddenLayers[0],
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }));

      // Hidden layers with dropout for regularization
      (this.globalModel as any).add(TensorFlow.layers.dropout({ rate: 0.2 }));

      for (let i = 1; i < this.config.hiddenLayers.length; i++) {
        (this.globalModel as any).add(TensorFlow.layers.dense({
          units: this.config.hiddenLayers[i],
          activation: 'relu'
        }));
        (this.globalModel as any).add(TensorFlow.layers.dropout({ rate: 0.2 }));
      }

      // Output layer
      (this.globalModel as any).add(TensorFlow.layers.dense({
        units: this.config.outputSize,
        activation: 'linear'
      }));

      // Compile model with advanced optimizer
      this.globalModel.compile({
        optimizer: TensorFlow.train.adam(this.config.learningRate),
        loss: 'meanSquaredError',
        metrics: ['mae', 'mse']
      });

      console.log('🧠 Global Neural Network initialized');
    } catch (error) {
      console.error('❌ Failed to initialize neural network:', error);
    }
  }

  async trainBusinessModel(businessId: string): Promise<void> {
    if (this.isTraining.get(businessId)) {
      console.log(`⏳ Model for business ${businessId} is already training`);
      return;
    }

    this.isTraining.set(businessId, true);

    try {
      console.log(`🎯 Training neural network for business: ${businessId}`);

      // Collect training data
      const trainingData = await this.collectTrainingData(businessId);

      if (trainingData.inputs.length < 100) {
        console.log(`⚠️ Insufficient data for business ${businessId}. Using global model.`);
        return;
      }

      // Create business-specific model
      const model = await this.createBusinessModel();

      // Prepare tensors
      const inputs = TensorFlow.tensor2d(trainingData.inputs);
      const outputs = TensorFlow.tensor2d(trainingData.outputs);

      // Train the model
      const history = await model.fit(inputs, outputs, {
        epochs: this.config.epochs,
        batchSize: this.config.batchSize,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 20 === 0) {
              console.log(`📊 Business ${businessId} - Epoch ${epoch}: Loss = ${logs?.loss?.toFixed(4)}`);
            }
          }
        }
      });

      // Save the trained model
      this.models.set(businessId, model);

      // Cache the model
      await this.cacheModel(businessId, model);

      // Clean up tensors
      inputs.dispose();
      outputs.dispose();

      console.log(`✅ Neural network training completed for business: ${businessId}`);
      this.emit('modelTrained', { businessId, loss: history.history.loss[history.history.loss.length - 1] });

    } catch (error) {
      console.error(`❌ Training failed for business ${businessId}:`, error);
    } finally {
      this.isTraining.set(businessId, false);
    }
  }

  async predictBusinessFuture(businessId: string, months: number = 12): Promise<PredictionOutput> {
    try {
      // Get or load model
      let model = this.models.get(businessId);

      if (!model) {
        // Try to load from cache
        model = await this.loadCachedModel(businessId);

        if (!model) {
          // Use global model as fallback
          model = this.globalModel;
          console.log(`🌍 Using global model for business: ${businessId}`);
        }
      }

      if (!model) {
        throw new Error('No model available for prediction');
      }

      // Prepare input data
      const inputData = await this.preparePredictionInput(businessId);
      const inputTensor = TensorFlow.tensor2d([inputData]);

      // Make prediction
      const prediction = model.predict(inputTensor) as TensorFlow.Tensor;
      const predictionData = await prediction.data();

      // Generate timeline predictions
      const timeline = await this.generateTimelinePredictions(businessId, months, model);

      // Clean up
      inputTensor.dispose();
      prediction.dispose();

      const result: PredictionOutput = {
        revenue: predictionData[0],
        expenses: predictionData[1],
        profit: predictionData[2],
        growth: predictionData[3],
        risk: predictionData[4],
        confidence: predictionData[5],
        timeline
      };

      // Cache prediction
      await CacheService.set(`prediction:${businessId}`, result, 3600); // 1 hour cache

      return result;

    } catch (error) {
      console.error(`❌ Prediction failed for business ${businessId}:`, error);
      throw error;
    }
  }

  private async collectTrainingData(businessId: string): Promise<{ inputs: number[][], outputs: number[][] }> {
    // Get historical records (last 2 years)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));

    const records = await Record.find({
      userId: businessId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const inputs: number[][] = [];
    const outputs: number[][] = [];

    // Create sliding window training data
    const windowSize = 30; // 30 days of data for each prediction

    for (let i = windowSize; i < records.length; i++) {
      const input = await this.extractFeatures(records.slice(i - windowSize, i));
      const output = await this.extractTargets(records.slice(i, i + 30)); // Predict next 30 days

      if (input && output) {
        inputs.push(input);
        outputs.push(output);
      }
    }

    return { inputs, outputs };
  }

  private async extractFeatures(records: any[]): Promise<number[] | null> {
    if (records.length === 0) return null;

    const features: number[] = [];

    // Revenue features
    const revenues = records.filter(r => r.type === 'income').map(r => r.amount);
    features.push(
      revenues.reduce((a, b) => a + b, 0), // Total revenue
      revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0, // Average revenue
      revenues.length > 0 ? Math.max(...revenues) : 0, // Max revenue
      revenues.length > 0 ? Math.min(...revenues) : 0  // Min revenue
    );

    // Expense features
    const expenses = records.filter(r => r.type === 'expense').map(r => r.amount);
    features.push(
      expenses.reduce((a, b) => a + b, 0), // Total expenses
      expenses.length > 0 ? expenses.reduce((a, b) => a + b, 0) / expenses.length : 0, // Average expenses
      expenses.length > 0 ? Math.max(...expenses) : 0, // Max expense
      expenses.length > 0 ? Math.min(...expenses) : 0  // Min expense
    );

    // Transaction features
    features.push(
      records.length, // Total transactions
      revenues.length, // Revenue transactions
      expenses.length, // Expense transactions
      records.length > 0 ? records.length / 30 : 0 // Daily average transactions
    );

    // Temporal features
    const dates = records.map(r => new Date(r.date));
    const dayOfWeek = dates[dates.length - 1].getDay();
    const month = dates[dates.length - 1].getMonth();
    const quarter = Math.floor(month / 3);

    features.push(
      dayOfWeek / 7, // Normalized day of week
      month / 12,   // Normalized month
      quarter / 4,  // Normalized quarter
      dates.length > 0 ? (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24) : 0 // Time span
    );

    // Category features (top 10 categories)
    const categories = [...new Set(records.map(r => r.category))].slice(0, 10);
    for (const category of categories) {
      const catRecords = records.filter(r => r.category === category);
      features.push(catRecords.reduce((a, b) => a + b.amount, 0));
    }

    // Pad or truncate to fixed size
    while (features.length < this.config.inputSize) {
      features.push(0);
    }

    return features.slice(0, this.config.inputSize);
  }

  private async extractTargets(records: any[]): Promise<number[] | null> {
    if (records.length === 0) return null;

    const revenues = records.filter(r => r.type === 'income').map(r => r.amount);
    const expenses = records.filter(r => r.type === 'expense').map(r => r.amount);

    const totalRevenue = revenues.reduce((a, b) => a + b, 0);
    const totalExpenses = expenses.reduce((a, b) => a + b, 0);
    const profit = totalRevenue - totalExpenses;

    // Calculate growth (compared to previous period)
    const growth = records.length > 0 ? (profit / (totalRevenue || 1)) * 100 : 0;

    // Calculate risk (volatility)
    const amounts = records.map(r => r.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const risk = Math.sqrt(variance) / (mean || 1);

    // Confidence based on data quality
    const confidence = Math.min(records.length / 30, 1); // More data = higher confidence

    return [
      totalRevenue,
      totalExpenses,
      profit,
      growth,
      risk,
      confidence
    ];
  }

  private async createBusinessModel(): Promise<TensorFlow.LayersModel> {
    const model = TensorFlow.sequential();

    // Similar architecture to global model but smaller for business-specific data
    model.add(TensorFlow.layers.dense({
      inputShape: [this.config.inputSize],
      units: 64,
      activation: 'relu'
    }));

    model.add(TensorFlow.layers.dropout({ rate: 0.3 }));
    model.add(TensorFlow.layers.dense({
      units: 32,
      activation: 'relu'
    }));

    model.add(TensorFlow.layers.dense({
      units: this.config.outputSize,
      activation: 'linear'
    }));

    model.compile({
      optimizer: TensorFlow.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  private async preparePredictionInput(businessId: string): Promise<number[]> {
    // Get last 30 days of data for prediction
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));

    const records = await Record.find({
      userId: businessId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const features = await this.extractFeatures(records);
    return features || new Array(this.config.inputSize).fill(0);
  }

  private async generateTimelinePredictions(businessId: string, months: number, model: TensorFlow.LayersModel): Promise<number[]> {
    const timeline: number[] = [];
    let currentInput = await this.preparePredictionInput(businessId);

    for (let month = 0; month < months; month++) {
      const inputTensor = TensorFlow.tensor2d([currentInput]);
      const prediction = model.predict(inputTensor) as TensorFlow.Tensor;
      const predictionData = await prediction.data();

      // Add revenue prediction to timeline
      timeline.push(predictionData[0]);

      // Update input for next prediction (use predicted values)
      currentInput = this.updateInputWithPrediction(currentInput, predictionData as Float32Array);

      inputTensor.dispose();
      prediction.dispose();
    }

    return timeline;
  }

  private updateInputWithPrediction(input: number[], prediction: Float32Array): number[] {
    // Update the input features with predicted values for next iteration
    const newInput = [...input];

    // Update revenue features with prediction
    newInput[0] = prediction[0]; // Total revenue
    newInput[1] = prediction[0] / 30; // Average daily revenue

    // Update expense features with prediction
    newInput[4] = prediction[1]; // Total expenses
    newInput[5] = prediction[1] / 30; // Average daily expenses

    // Update profit
    newInput[8] = prediction[2]; // Profit

    return newInput;
  }

  private async cacheModel(businessId: string, model: TensorFlow.LayersModel): Promise<void> {
    try {
      const modelData = await model.save('file:///tmp/model');
      await CacheService.set(`model:${businessId}`, modelData, 86400); // 24 hours cache
    } catch (error) {
      console.error('❌ Failed to cache model:', error);
    }
  }

  private async loadCachedModel(businessId: string): Promise<TensorFlow.LayersModel | null> {
    try {
      const cachedModel = await CacheService.get(`model:${businessId}`);
      if (cachedModel) {
        return await TensorFlow.loadLayersModel('file:///tmp/model');
      }
    } catch (error) {
      console.error('❌ Failed to load cached model:', error);
    }
    return null;
  }

  // Global model training with aggregated data
  async trainGlobalModel(): Promise<void> {
    try {
      console.log('🌍 Training global neural network with aggregated business data...');

      // Collect data from all businesses
      const businesses = await Business.find({ isActive: true }).limit(1000);
      const allInputs: number[][] = [];
      const allOutputs: number[][] = [];

      for (const business of businesses) {
        const trainingData = await this.collectTrainingData(business._id.toString());
        if (trainingData.inputs.length > 0) {
          allInputs.push(...trainingData.inputs);
          allOutputs.push(...trainingData.outputs);
        }
      }

      if (allInputs.length === 0) {
        console.log('⚠️ No training data available for global model');
        return;
      }

      // Prepare tensors
      const inputs = TensorFlow.tensor2d(allInputs);
      const outputs = TensorFlow.tensor2d(allOutputs);

      // Train global model
      const history = await this.globalModel!.fit(inputs, outputs, {
        epochs: this.config.epochs,
        batchSize: this.config.batchSize,
        validationSplit: 0.1,
        shuffle: true
      });

      console.log(`✅ Global model training completed. Final loss: ${history.history.loss[history.history.loss.length - 1]}`);

      // Clean up
      inputs.dispose();
      outputs.dispose();

    } catch (error) {
      console.error('❌ Global model training failed:', error);
    }
  }

  async getModelStats(): Promise<any> {
    return {
      totalModels: this.models.size,
      trainingModels: Array.from(this.isTraining.entries()).filter(([_, training]) => training).length,
      globalModelLoaded: this.globalModel !== null,
      config: this.config
    };
  }
}

export default NeuralPredictionEngine;
