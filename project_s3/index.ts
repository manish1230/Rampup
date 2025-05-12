import express, { Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { Worker } from 'worker_threads';
import path from 'path';
import { S3DownloadError, ProcessingError } from './error';
import { WorkerResult, RecordData } from './types';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const processChunkWithWorker = (dataChunk: RecordData[]): Promise<WorkerResult[]> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
      workerData: dataChunk,
    });

    worker.on('message', resolve);
    worker.on('error', (err) => reject(new ProcessingError(`Worker error: ${err.message}`)));
    worker.on('exit', (code) => {
      if (code !== 0) reject(new ProcessingError(`Worker stopped with exit code ${code}`));
    });
  });
};

const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delay * 2 ** i));
    }
  }
  throw new Error('Unreachable');
};

app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  (async () => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    try {
      const fileContent: RecordData[] = JSON.parse(file.buffer.toString());

      const chunkSize = 2000;
      const chunks: RecordData[][] = [];
      for (let i = 0; i < fileContent.length; i += chunkSize) {
        chunks.push(fileContent.slice(i, i + chunkSize));
      }

      const processedChunks = await Promise.all(chunks.map(processChunkWithWorker));

      const successes: RecordData[] = [];
      const failures: any[] = [];

      const processedData = processedChunks.flat();

      processedData.forEach((result) => {
        if (result.success) {
          successes.push(result.record!); // fixed undefined issue here too
        } else {
          failures.push(result.error);
        }
      });

      const fileName = `${Date.now()}-${file.originalname}`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
        Body: JSON.stringify(processedData),
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      console.log(`${successes.length} records processed successfully`);
      console.log(`${failures.length} records failed`);

    //   failures.forEach((err, idx) => {
    //     console.log(`${idx + 1}. [${err.name}] ${err.message}`);
    //   });

      res.json({
        message: 'File uploaded with processing report',
        successfulRecords: successes.length,
        failedRecords: failures.length,
        errors: failures.slice(0, 5),
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed', reason: error.message });
    }
  })();
});


app.get('/download/:key', async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    const url = await retry(() => getSignedUrl(s3, command, { expiresIn: 60 }));
    res.json({ downloadUrl: url });
  } catch (error: any) {
    console.error('Download failed:', error);
    res.status(500).json({
      error: new S3DownloadError(`Failed to generate download URL: ${error.message}`).message,
    });
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});





// const express = require('express');
// const multer = require('multer');
// const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
// const dotenv = require('dotenv');

// const { Worker } = require('worker_threads');
// const path = require('path');
// const fs = require('fs');

// const { S3DownloadError, ProcessingError } = require('./error.js');


// dotenv.config();

// const app = express();
// const upload = multer({
//     storage: multer.memoryStorage(),
//     //  fileFilter: (req, file, cb) => {
//     //     if (file.mimetype !== 'application/json') {
//     //       return cb(new Error('Only JSON files are allowed'), false);
//     //     }
//     //     cb(null, true);
//     //   }
// });

// // AWS S3 client setup
// const s3 = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     },
// });

// // Function to process data in worker threads
// const processChunkWithWorker = (dataChunk) => {
//     return new Promise((resolve, reject) => {
//         const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
//             workerData: dataChunk,   // Pass data chunk to worker
//         });

//         worker.on('message', resolve);

//         //error handling 3
//         worker.on('error', (err) => {
//             reject(new ProcessingError(`Worker error: ${err.message}`));
//         });

//         worker.on('exit', (code) => {
//             if (code !== 0) reject(new ProcessingError(`Worker stopped with exit code ${code}`));
//         });
//     });
// };

// // Upload endpoint
// app.post('/upload', upload.single('file'), async (req, res) => {
//     const file = req.file;


//     try {
//         // Parse the JSON file (convert buffer to string and parse)
//         const fileContent = JSON.parse(file.buffer.toString());

//         // Split the data into 10 chunks (each with 2000 records)
//         const chunkSize = 2000;
//         const chunks = [];
//         for (let i = 0; i < fileContent.length; i += chunkSize) {
//             chunks.push(fileContent.slice(i, i + chunkSize));
//         }

//         // Process each chunk with a worker thread
//         const processedChunks = await Promise.all(chunks.map(processChunkWithWorker));

//         const successes = [];
//         const failures = [];
//         // console.log("*****");
//         // Combine all processed chunks
//         const processedData = processedChunks.flat();   // Flatten the array of processed data

//         processedData.forEach(result => {
//             if (result.success) {
//                 successes.push(result.data);
//             } else {
//                 failures.push(result.error);
//             }
//         });

//         // 
//         // Simulate uploading the processed data to S3
//         const fileName = `${Date.now()}-${file.originalname}`;
//         // const uploadParams = {
//         //     Bucket: process.env.S3_BUCKET_NAME,
//         //     Key: fileName,
//         //     Body: JSON.stringify(processedData),  // Save processed data
//         //     ContentType: 'application/json',
//         // };

//         const uploadParams = {
//             Bucket: process.env.S3_BUCKET_NAME,
//             Key: fileName,
//             //  Body: file.buffer,
//             Body: JSON.stringify(processedData),
//             ContentType: file.mimetype,
//         };

//             await s3.send(new PutObjectCommand(uploadParams));
//             console.log(` ${successes.length} records processed successfully`);
//             console.log(` ${failures.length} records failed`);

//         failures.forEach((err, idx) => {
//             console.log(`  ${idx + 1}. [${err.type}] ${err.message}`);
//         });

//         res.json({
//             message: 'File uploaded with processing report',
//             successfulRecords: successes.length,
//             failedRecords: failures.length,
//             errors: failures.slice(0, 5), // Send top 5 errors to client
//         });

//     } catch (error) {
//         console.error('Upload error:', error);
//         res.status(500).json({ error: 'Upload failed', reason: error.message });
//     }
// });

// // Download endpoint
// // Helper function: retry with exponential backoff
// const retry = async (fn, retries = 3, delay = 500) => {
//     for (let attempt = 1; attempt <= retries; attempt++) {
//         try {
//             return await fn();
//         } catch (err) {
//             if (attempt === retries) throw err;
//             await new Promise(res => setTimeout(res, delay * attempt)); // exponential backoff
//         }
//     }
// };

// app.get('/download/:key', async (req, res) => {
//     const key = req.params.key;

//     try {
//         const command = new GetObjectCommand({
//             Bucket: process.env.S3_BUCKET_NAME,
//             Key: key,
//         });

//         // Retry getSignedUrl up to 3 times
//         const url = await retry(() =>
//             getSignedUrl(s3, command, { expiresIn: 60 })
//         );

//         res.json({ downloadUrl: url });

//     } catch (error) {
//         console.error('Download failed:', error);
//      const err = new S3DownloadError(`Failed to generate download URL: ${error.message}`);

//         res.status(500).json({ error:err.message});
//     }
// });



// // app.get('/download/:key', async (req, res) => {
// //     const key = req.params.key;

// //     const getObjectParams = {
// //         Bucket: process.env.S3_BUCKET_NAME,
// //         Key: key,
// //     };

// //     try {
// //         const command = new GetObjectCommand(getObjectParams);
// //         const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min
// //         res.json({ downloadUrl: url });
// //     } catch (error) {
// //         console.error('Download error:', error);
// //         const err = new S3DownloadError(`Failed to generate download URL: ${error.message}`);

// //         res.status(500).json({ error: err.message });
// //     }
// // });

// // Start server
// app.listen(3000, () => {
//     console.log('Server running at http://localhost:3000');
// });





