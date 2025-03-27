import { ReactNode, useState } from "react";

type TabKey = "sensors" | "camera";

interface TabsProps {
  children: {
    sensors: ReactNode;
    camera: ReactNode;
  };
  defaultTab?: TabKey;
}

export function TabLayout({ children, defaultTab = "sensors" }: TabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  return (
    <div className="tab-container">
      <div className="tab-header">
        <button
          className={`tab-button ${activeTab === "sensors" ? "active" : ""}`}
          onClick={() => setActiveTab("sensors")}
        >
          Sensors
        </button>
        <button
          className={`tab-button ${activeTab === "camera" ? "active" : ""}`}
          onClick={() => setActiveTab("camera")}
        >
          Camera
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "sensors" && children.sensors}
        {activeTab === "camera" && children.camera}
      </div>
    </div>
  );
}
