import { Gauge, gaugeClasses } from "@mui/x-charts";

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  width?: number;
  height?: number;
  className?: string;
  arcColor?: string;
  restColor?: string;
  text?: () => string;
}

function GaugeBase({
  value,
  min,
  max,
  width = 100,
  height = 100,
  className,
  arcColor,
  restColor,
  ...gaugeProps
}: GaugeProps) {
  const flag = ![min, max].includes(undefined)
    ? value < (min as number) + 10 || value > (max as number) - 10
    : false;
  return (
    <Gauge
      startAngle={-100}
      endAngle={100}
      {...gaugeProps}
      height={height}
      width={width}
      value={value}
      valueMin={min}
      valueMax={max}
      className={className}
      sx={(theme) => ({
        [`.${gaugeClasses.valueText}`]: {
          fontSize: 10,
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
