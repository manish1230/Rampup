const { Worker } = require('worker_threads');

const worker = new Worker('./worker.js', {
  workerData: 100  // We want to compute sum from 1 to 100
});

worker.on('message', (result) => {
  console.log(`Sum from 1 to 100 is: ${result}`);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

worker.on('exit', (code) => {
  if (code !== 0)
    console.log(`Worker stopped with exit code ${code}`);
});

console.log('Main thread is still running...');