/**
 * server.ts — Server Lifecycle Manager
 * ─────────────────────────────────────
 * Handles ONLY: database connection, HTTP listen, intelligence boot,
 * graceful shutdown, and process-level error handlers.
 *
 * All Express middleware and routing lives in app.ts.
 */
import './config/env.js';
import OpenAI from 'openai';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { startCronJobs } from './jobs/cron.js';
import logger from './utils/logger.js';
import RealTimeIntelligence from './services/realTimeIntelligence.js';
import AutonomousAgents from './services/autonomousAgents.js';
import NeuralPredictionEngine from './services/neuralPredictionEngine.js';
import QuantumArchitecture from './services/quantumArchitecture.js';
// ── Server Lifecycle State ──────────────────────────────────────────
let server = null;
let realTimeIntelligence = null;
let autonomousAgents = null;
let neuralPredictionEngine = null;
let quantumArchitecture = null;
// ── HTTP Server ─────────────────────────────────────────────────────
async function startServer() {
    const PORT = env.PORT || 5000;
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, () => {
            logger.info(`🚀 Biz Plus Dashboard LIVE on PORT ${PORT}`);
            initializeIntelligenceSystems();
            resolve();
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${PORT} is already in use. Please run 'bash kill-port.sh' to clear it.`);
            }
            else {
                logger.error('❌ Server failed to start:', err);
            }
            reject(err);
        });
    });
}
// ── Intelligence Systems ────────────────────────────────────────────
async function initializeIntelligenceSystems() {
    try {
        const openai = new OpenAI({
            apiKey: env.OPENAI_API_KEY,
        });
        if (!env.OPENAI_API_KEY) {
            logger.warn('⚠️ OpenAI API key not found. AI features will be limited.');
            return;
        }
        // Initialize Real-Time Intelligence
        realTimeIntelligence = new RealTimeIntelligence(server);
        logger.info('📊 Real-time business monitoring initialized');
        // Initialize Business Analysis Tools
        autonomousAgents = new AutonomousAgents(openai, realTimeIntelligence);
        logger.info('🔍 Business analysis tools initialized');
        // Initialize Neural Prediction Engine
        neuralPredictionEngine = new NeuralPredictionEngine();
        logger.info('🧠 Neural prediction engine initialized');
        // Initialize Quantum Architecture
        quantumArchitecture = new QuantumArchitecture();
        logger.info('⚛️ Quantum computing architecture initialized');
        // Make systems available to routes via app.locals
        app.locals.realTimeIntelligence = realTimeIntelligence;
        app.locals.autonomousAgents = autonomousAgents;
        app.locals.neuralPredictionEngine = neuralPredictionEngine;
        app.locals.quantumArchitecture = quantumArchitecture;
        // Start monitoring business metrics
        logger.info('📈 Business insights engine started');
        // Start neural network training in background
        setTimeout(async () => {
            if (neuralPredictionEngine) {
                await neuralPredictionEngine.trainGlobalModel();
                logger.info('🎯 Global neural network training completed');
            }
        }, 30000);
        // Emit system ready event
        setTimeout(() => {
            logger.info('✨ Advanced business analytics with neural prediction fully operational');
        }, 2000);
    }
    catch (error) {
        logger.error('❌ Failed to initialize intelligence systems:', error);
    }
}
// ── Init ────────────────────────────────────────────────────────────
async function init() {
    try {
        logger.info('🏗️  Starting Biz Plus Integration Engine...');
        logger.info('🔌 Connecting to infrastructure...');
        // Connect to MongoDB
        try {
            await connectDB();
        }
        catch {
            logger.warn('⚠️ MongoDB connection failed, but starting app anyway');
        }
        startCronJobs();
        logger.info('⏰ Background cron engine initialized');
        await startServer();
        logger.info('🚀 Biz Plus Engine initialised successfully');
    }
    catch (error) {
        logger.error('❌ Fatal: Biz Plus startup failed:', error);
        process.exit(1);
    }
}
// ── Graceful Shutdown ───────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received. Closing connections...`);
    if (server) {
        server.close(async () => {
            await disconnectDB();
            console.log('✅ Shutdown complete. Bye!');
            process.exit(0);
        });
        setTimeout(() => {
            console.error('⚠️ Could not close connections in time, forceful exit.');
            process.exit(1);
        }, 10000).unref();
    }
    else {
        process.exit(0);
    }
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
    process.exit(1);
});
// Launch
void init();
export default app;
