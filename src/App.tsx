import { useEffect, useState } from "react";
import "./App.css";

type Colour = "default" | "red" | "green" | "blue";

interface MinMax {
  min?: number;
  max?: number;
}

interface Data {
  pressure: number;
  temperature: number;
  humidity: number;
}

type ColourMap = Record<keyof Data, MinMax>;

const UPDATE_INTERVAL = 10000; // 10 seconds

const COLOUR_MAP: ColourMap = {
  pressure: { min: 950, max: 1050 },
  temperature: { min: 14, max: 26 },
  humidity: { min: 50, max: 90 },
};

function calculateColour(
  valueType: keyof Data,
  value: number,
  colourMap: ColourMap,
) {
  let colour: Colour = "default";

  const thresholds = colourMap[valueType];

  if (thresholds.min !== undefined && value < thresholds.min) {
    colour = "blue";
  } else if (thresholds.max !== undefined && value > thresholds.max) {
    colour = "red";
  }

  return colour;
}

function App() {
  const [apiResponse, setApiResponse] = useState<Data>();

  const [pressureColour, setPressureColour] = useState<Colour>("default");
  const [temperatureColour, setTemperatureColour] = useState<Colour>("default");
  const [humidityColour, setHumidityColour] = useState<Colour>("default");

  async function fetchData() {
    const response = await fetch("/api/v3/data/");
    return await response.json();
  }

  function updateColours(data: Data) {
    const { pressure, temperature: temp, humidity } = data;

    setPressureColour(calculateColour("pressure", pressure, COLOUR_MAP));
    setTemperatureColour(calculateColour("temperature", temp, COLOUR_MAP));
    setHumidityColour(calculateColour("humidity", humidity, COLOUR_MAP));

    return data;
  }

  useEffect(() => {
    const update = () => fetchData().then(updateColours).then(setApiResponse);

    const doUpdate = () => {
      update().catch(console.error);
    };

    doUpdate();

    const interval = setInterval(doUpdate, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1>DATA:</h1>
      {apiResponse && (
        <div className="data">
          <p className="data-row">
            <span>Pressure: </span>
            <span className={`text-${pressureColour}`}>
              {apiResponse.pressure.toFixed(0)} hPa
            </span>
          </p>
          <p className="data-row">
            <span>Temperature: </span>
            <span className={`text-${temperatureColour}`}>
              {apiResponse.temperature.toFixed(1)} °C
            </span>
          </p>
          <p className="data-row">
            <span>Humidity: </span>
            <span className={`text-${humidityColour}`}>
              {apiResponse.humidity.toFixed(0)} %
            </span>
          </p>
        </div>
      )}
    </>
  );
}

export default App;
