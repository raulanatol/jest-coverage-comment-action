
export interface CoverageMeasure {
  percentage: number;
}

export interface Measure {
  date: Date;
  coverageMeasure: CoverageMeasure;
}
