import { parentPort, workerData } from 'worker_threads';
import { RecordData, WorkerResult } from './types';
import { ValidationError, ProcessingError } from './error';

// Check if a record has valid format
function isValid(record: RecordData): boolean {
  return typeof record.name === 'string';
}

// Simulate processing by adding a timestamp
function process(record: RecordData): RecordData {
  return {
    ...record,
    processedAt: new Date().toISOString(),
  };
}

// Prepare results array
const results: WorkerResult[] = [];

for (const record of workerData) {
  try {
    if (!isValid(record)) {
      throw new ValidationError('Record must have id and name as strings');
    }

    const updatedRecord = process(record);
    results.push({ success: true, record: updatedRecord });

  } catch (error: any) {
    // Return error info with the original record
    results.push({
      success: false,
      error: {
        name: error.name || 'ProcessingError',
        message: error.message || 'Unknown error',
        record,
      }
    });
  }
}

// Send results back to the main thread
parentPort?.postMessage(results);




// import { parentPort, workerData } from 'worker_threads';
// import { RecordData, WorkerResult } from './types';
// import { ValidationError, ProcessingError } from './error';

// function validate(record: RecordData): boolean {
//   return record && typeof record.id === 'string' && typeof record.name === 'string';
// }

// function processRecord(record: RecordData): RecordData {
//   return { ...record, processedAt: new Date().toISOString() };
// }

// const results: WorkerResult[] = [];

// for (const record of workerData) {
//   try {
//     if (!validate(record)) throw new ValidationError('Invalid record format');
//     const processed = processRecord(record);
//     results.push({ success: true, record: processed });
//   } catch (err: any) {
//     results.push({ success: false, error: { name: err.name, message: err.message, record } });
//   }
// }

// parentPort?.postMessage(results);



// const { parentPort, workerData } = require('worker_threads');

// // error handling
// const { ValidationError, ProcessingError } = require('./error.js');

// // Function to process each record (e.g., validate, enrich, etc.)
// const processRecord = (record) => {
//   // Validate the record (basic validation)
//   try{
  
//   if (!record.id || !record.name) {
//     throw new ValidationError('Invalid record: Missing required fields');
//   }

//   // Simulate processing (e.g., add a timestamp and enrich the data)
//   record.processedAt = new Date().toISOString();
//   record.processed = true;
//   record.enriched = `Enriched data for ${record.name}`;
//   //  console.log(record);

//   return { success: true, record };

// }catch(error){
//   // Attach context to the error
//   return {
//     success: false,
//     error: {
//       message: error.message,
//       name: error.name,
//       stack: error.stack,
//       record,
//     },
//   };
//  }
// };

// // Process each record in the chunk
// const result = workerData.map(processRecord);

// // Send the processed data back to the main thread
// parentPort.postMessage(result);
