// centralized erro handling
// const express = require('express');
// const app = express();

// // Middleware to parse JSON
// app.use(express.json());

// // Custom Error Class
// class AppError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     this.isOperational = true;
//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// // Sample Route: Simulates a failure
// app.get('/fail', (req, res, next) => {
//   // Simulate an error
//   next(new AppError('Something went wrong in /fail route', 400));
// });

// // Another route that throws
// app.get('/crash', (req, res, next) => {
//   throw new Error('This is a thrown error, not caught!');
// });

// // Centralized Error-Handling Middleware
// app.use((err, req, res, next) => {
//   console.error('❌ Error caught:', err);

//   const statusCode = err.statusCode || 500;
//   const message = err.message || 'Internal Server Error';

//   res.status(statusCode).json({
//     status: 'error',
//     message,
   
//   });
// });

// // Start server
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });



//retry logic
// async function fetchDataWithRetry(retries = 3, delay = 1000) {
//   for (let i = 0; i < retries; i++) {
//     try {
//       //Fake api call
//       const result = await fakeApiCall();
//       return result; // Success!
//     } catch (err) {
//       console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);

//       if (i === retries - 1) {
//         throw new Error('Operation failed after maximum retries');
//       }

//       // Wait before next retry
//       await new Promise(res => setTimeout(res, delay));
//     }
//   }
// }

// async function fakeApiCall() {
//   // Randomly succeed or fail
//   if (Math.random() < 0.5) {
//     throw new Error('Temporary error');
//   }
//   return '✅ Success';
// }

// fetchDataWithRetry()
//   .then(console.log)
//   .catch(console.error);



//Async error propagation
// async function levelOne() {
//   try {
//     await levelTwo();
//   } catch (err) {
//     console.error('Error caught in levelOne:', err.message);
//   }
// }

// async function levelTwo() {
//   await levelThree();
// }

// async function levelThree() {
//   throw new Error('Something went wrong in levelThree');
// }

// levelOne();
