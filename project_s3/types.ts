export interface RecordData {
  id: string;
  name: string;
  [key: string]: any;
}

export interface WorkerResult {
  success: boolean;
  record?: RecordData;
  error?: {
    name: string;
    message: string;
    record: RecordData;
  };
}
