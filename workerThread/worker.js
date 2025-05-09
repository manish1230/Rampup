const { parentPort, workerData } = require('worker_threads');

function calculateSum(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

const result = calculateSum(workerData);

// Send the result back to the main thread
parentPort.postMessage(result);
