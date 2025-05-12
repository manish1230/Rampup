"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3DownloadError = exports.ProcessingError = exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class ProcessingError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProcessingError';
    }
}
exports.ProcessingError = ProcessingError;
class S3DownloadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'S3DownloadError';
    }
}
exports.S3DownloadError = S3DownloadError;
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
