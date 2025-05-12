export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessingError';
  }
}

export class S3DownloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'S3DownloadError';
  }
}



// class AppError extends Error {
//     constructor(message) {
//         super(message);
//         this.name = this.constructor.name;
//         Error.captureStackTrace(this, this.constructor);
//     }
// }

// class ValidationError extends AppError {}
// class ProcessingError extends AppError {}
// class S3DownloadError extends AppError {}

// module.exports = { ValidationError, ProcessingError, S3DownloadError };
