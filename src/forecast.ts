
export type WindType = 'true' | 'false' | 'speed' | 'direction' | 'barb' | 'barb-and-speed' | 'barb-and-direction' | 'barb-speed-and-direction';
export type ShowDateType = 'false' | 'boundary' | 'all';
export type IconFillType = 'single' | 'full' | number;

export interface ForecastSegment {
  clouds: number; // 100
  condition: string; // "cloudy"
  datetime: string; // "2022-06-03T22:00:00+00:00"
  precipitation: number; // 0
  precipitation_probability: number; // 85
  pressure: number; // 1007
  temperature: number; // 61
  wind_bearing: number | string; // 153 | 'SSW'
  wind_speed: number; // 3.06
}

export interface SegmentTemperature {
  hour: string,
  date: string,
  temperature: string
}

export interface SegmentWind {
  hour: string,
  windSpeed: string,
  windSpeedRawMS: number,
  windDirection: string,
  windDirectionRaw: number | string
}

export interface SegmentPrecipitation {
  hour: string,
  precipitationAmount: string,
  precipitationProbability: string,
  precipitationProbabilityText: string
}

export type ForecastType = "hourly" | "daily" | "twice_daily";

export type Forecasts = ForecastSegment[];

export interface ForecastEvent {
  type: ForecastType;
  forecast: Forecasts | null;
}
