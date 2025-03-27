import { useEffect, useState } from "react";
import "./App.css";
import { LoadingSpinner } from "./components/LoadingSpinner/LoadingSpinner.tsx";
import { Player } from "./components/VideoPlayer/Player.tsx";
import {
  GaugeHumidity,
  GaugePressure,
  GaugeTemperature,
} from "./components/Gauges/Guages.tsx";
import { TabLayout } from "./components/Tabs/TabLayout.tsx";

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
  temperature: { min: 15, max: 26 },
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

const __DEV__ = import.meta.env.MODE === "development";

function App() {
  const API_URL = __DEV__ ? "http://localhost:8000/api/v3/" : "/api/v3/";

  const [apiResponse, setApiResponse] = useState<Data>();

  const [pressureColour, setPressureColour] = useState<Colour>("default");
  const [temperatureColour, setTemperatureColour] = useState<Colour>("default");
  const [humidityColour, setHumidityColour] = useState<Colour>("default");

  async function fetchData() {
    const url = API_URL + "data/";
    const response = await fetch(url);
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

  const SensorsContent = (
    <>
      {!apiResponse && <LoadingSpinner className={"text-grey"} />}
      {apiResponse && (
        <div className="data">
          {/* Your existing gauge components */}
          <p className="data-row">
            <span>Pressure: </span>
            <GaugePressure
              value={parseInt(apiResponse.pressure.toFixed(0))}
              className={`text-${pressureColour}`}
              arcColor={"#036fb2"}
              restColor={"#03b2ad"}
            />
          </p>
          <p className="data-row">
            <span>Temperature: </span>

            <GaugeTemperature
              value={apiResponse.temperature}
              className={`text-${temperatureColour}`}
              arcColor={"#f15555"}
              restColor={"#036fb2"}
            />
          </p>
          <p className="data-row">
            <span>Humidity: </span>

            <GaugeHumidity
              value={apiResponse.humidity}
              className={`text-${humidityColour}`}
              arcColor={"#03b2ad"}
              restColor={"#f15555"}
            />
          </p>
        </div>
      )}
    </>
  );

  const CameraContent = (
    <>
      <Player src="/vid.jpeg" />
    </>
  );

  return (
    <>
      {__DEV__ && <span>HELLO, DEV!</span>}
      <TabLayout>
        {{
          sensors: SensorsContent,
          camera: CameraContent,
        }}
      </TabLayout>
    </>
  );
}

export default App;
