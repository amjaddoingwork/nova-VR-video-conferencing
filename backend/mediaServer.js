const mediasoup = require('mediasoup');

class MediaServer {
  constructor() {
    this.workers = [];
    this.rooms = new Map();
    this.workerIndex = 0;
    this.initialized = false;
  }

  async initialize(numWorkers = 4) {
    try {
      // Ensure we only initialize once
      if (this.initialized) {
        console.log('MediaServer already initialized');
        return;
      }

      console.log('Initializing MediaSoup with', numWorkers, 'workers...');
      for (let i = 0; i < numWorkers; i++) {
        const worker = await mediasoup.createWorker({
          logLevel: 'warn',
          rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT || '10000') + (i * 1000),
          rtcMaxPort: parseInt(process.env.MEDIASOUP_MIN_PORT || '10000') + ((i + 1) * 1000) - 1,
        });
        
        worker.on('died', () => {
          console.error(`MediaSoup Worker ${i} died, exiting in 2 seconds...`);
          setTimeout(() => process.exit(1), 2000);
        });
        
        this.workers.push(worker);
        console.log(`MediaSoup Worker ${i + 1} initialized`);
      }
      
      this.initialized = true;
      console.log('MediaSoup initialization complete with', this.workers.length, 'workers');
    } catch (error) {
      console.error('MediaSoup initialization failed:', error);
      throw error;
    }
  }

  async createRoom(roomId) {
    if (!this.initialized || this.workers.length === 0) {
      await this.initialize();
    }
    
    try {
      const worker = this.workers[this.workerIndex];
      this.workerIndex = (this.workerIndex + 1) % this.workers.length;

      const router = await worker.createRouter({
        mediaCodecs: [
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: {
              'x-google-start-bitrate': 1000
            }
          },
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2
          }
        ]
      });

      this.rooms.set(roomId, router);
      console.log(`Created router for room ${roomId}`);
      return router;
    } catch (error) {
      console.error(`Error creating room ${roomId}:`, error);
      throw error;
    }
  }

  async getRouter(roomId) {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId);
    }
    
    return await this.createRoom(roomId);
  }

  async createTransport(router, isProducer) {
    try {
      const transport = await router.createWebRtcTransport({
        listenIps: [{ 
          ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0', 
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || (process.env.NODE_ENV === 'production' ? '127.0.0.1' : 'localhost') 
        }],
        initialAvailableOutgoingBitrate: 1000000,
        minimumAvailableOutgoingBitrate: 600000,
        maxSctpMessageSize: 262144,
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });
      
      console.log('Transport created successfully', transport.id);
      return transport;
    } catch (error) {
      console.error('Error creating transport:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      for (const worker of this.workers) {
        await worker.close();
      }
      this.workers = [];
      this.rooms.clear();
      this.initialized = false;
      console.log('MediaServer cleanup complete');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

const mediaServerInstance = new MediaServer(); 

// Export initialization as a promise to ensure it's ready when server starts
const initPromise = (async () => {
  try {
    console.log('Starting MediaServer initialization...');
    await mediaServerInstance.initialize();
    console.log('MediaServer initialized successfully');
    return mediaServerInstance;
  } catch (error) {
    console.error('Failed to initialize MediaServer:', error);
    throw error;
  }
})();

module.exports = mediaServerInstance;
module.exports.initPromise = initPromise; 