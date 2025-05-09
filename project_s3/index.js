const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const dotenv = require('dotenv');

const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const upload = multer({
    storage: multer.memoryStorage(),
    //  fileFilter: (req, file, cb) => {
    //     if (file.mimetype !== 'application/json') {
    //       return cb(new Error('Only JSON files are allowed'), false);
    //     }
    //     cb(null, true);
    //   }
});

// AWS S3 client setup
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Function to process data in worker threads
const processChunkWithWorker = (dataChunk) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
            workerData: dataChunk,   // Pass data chunk to worker
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;


    try {
        // Parse the JSON file (convert buffer to string and parse)
        const fileContent = JSON.parse(file.buffer.toString());

        // Split the data into 10 chunks (each with 2000 records)
        const chunkSize = 2000;
        const chunks = [];
        for (let i = 0; i < fileContent.length; i += chunkSize) {
            chunks.push(fileContent.slice(i, i + chunkSize));
        }

        // Process each chunk with a worker thread
        const processedChunks = await Promise.all(chunks.map(processChunkWithWorker));


        // Combine all processed chunks
        const processedData = processedChunks.flat();   // Flatten the array of processed data

        // Simulate uploading the processed data to S3
        const fileName = `${Date.now()}-${file.originalname}`;
        // const uploadParams = {
        //     Bucket: process.env.S3_BUCKET_NAME,
        //     Key: fileName,
        //     Body: JSON.stringify(processedData),  // Save processed data
        //     ContentType: 'application/json',
        // };

        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
          //  Body: file.buffer,
            Body:JSON.stringify(processedData),
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        res.json({ message: 'File uploaded successfully', key: fileName });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Download endpoint
app.get('/download/:key', async (req, res) => {
    const key = req.params.key;

    const getObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    };

    try {
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min
        res.json({ downloadUrl: url });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
