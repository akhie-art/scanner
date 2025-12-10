export interface ScannedDoc {
  id: string;
  title: string;
  originalImage: string; // Base64
  processedImage: string; // Base64 (after filters)
  createdAt: number;
  extractedText?: string;
  filter: FilterType;
}

export enum FilterType {
  ORIGINAL = 'original',
  MAGIC = 'magic',
  BW = 'bw',
  GRAYSCALE = 'grayscale',
  LIGHTEN = 'lighten'
}

export enum AppView {
  LIST = 'list',
  CAMERA = 'camera',
  EDITOR = 'editor'
}
