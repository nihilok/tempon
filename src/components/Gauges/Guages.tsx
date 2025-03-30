import { Gauge, gaugeClasses } from "@mui/x-charts";

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  width?: number;
  height?: number;
  className?: string;
  inAlarm?: boolean;
  arcColor?: string;
  restColor?: string;
  text?: () => string;
}

function GaugeBase({
  value,
  min,
  max,
  className,
  inAlarm = false,
  arcColor,
  restColor,
  ...gaugeProps
}: GaugeProps) {
  const flag = inAlarm;
  return (
    <Gauge
      startAngle={-100}
      endAngle={100}
      {...gaugeProps}
      value={value}
      valueMin={min}
      valueMax={max}
      className={className}
      sx={(theme) => ({
        [`.${gaugeClasses.valueText}`]: {
          fontSize: 12,
        },
        [`& .${gaugeClasses.valueArc}`]: {
          fill: arcColor ? arcColor : flag ? "#b23702" : "#52b202",
        },
        [`& .${gaugeClasses.referenceArc}`]: {
          fill: restColor || theme.palette.text.disabled,
        },
      })}
    />
  );
}

export function GaugePressure({ value, ...gaugeProps }: GaugeProps) {
  return (
    <GaugeBase
      value={value}
      min={950}
      max={1050}
      text={() => `${value} hPa`}
      {...gaugeProps}
    />
  );
}

export function GaugeTemperature({ value, ...gaugeProps }: GaugeProps) {
  return (
    <GaugeBase
      value={value}
      min={0}
      max={50}
      text={() => `${value} °C`}
      {...gaugeProps}
    />
  );
}

export function GaugeHumidity({ value, ...gaugeProps }: GaugeProps) {
  return (
    <GaugeBase
      value={value}
      min={0}
      max={100}
      text={() => `${value} %`}
      {...gaugeProps}
    />
  );
}
