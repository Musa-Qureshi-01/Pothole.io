export interface SegmentationMetrics {
  area_pixels?: number | null;
  area_ratio?: number | null;
  iou?: number | null;
  dice?: number | null;
  boundary_f1?: number | null;
  area_error?: number | null;
  length_error?: number | null;
  severity?: number | null;
  stability?: number | null;
}

export interface PotholePredictionResponse {
  is_pothole: boolean;
  confidence: number;
  message: string;
  metrics: SegmentationMetrics | null;
  mask_png_base64: string | null;
  overlay_png_base64: string | null;
}

export interface PredictionRecord {
  id: string;
  timestamp: string;
  imageDataUrl: string;
  overlayDataUrl: string | null;
  maskDataUrl: string | null;
  isPothole: boolean;
  confidence: number;
  message: string;
  metrics: SegmentationMetrics | null;
  location: { lat: number; lng: number } | null;
  // When we persist a prediction into Neon `reports`, we store the row id here so
  // later report generation can update the same DB row.
  reportId?: string | null;
}
