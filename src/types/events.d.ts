declare interface ScanCompletedEvent extends CustomEvent {
  detail: {
    scanId: string;
    projectId: string;
  };
}

declare interface Window {
  addEventListener(type: 'scan-completed', listener: (event: ScanCompletedEvent) => void): void;
  removeEventListener(type: 'scan-completed', listener: (event: ScanCompletedEvent) => void): void;
} 