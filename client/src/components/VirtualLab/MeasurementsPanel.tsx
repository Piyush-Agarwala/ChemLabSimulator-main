import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface MeasurementsData {
  ph: number;
  volume: number;
  molarity: number;
  temperature: number;
}

interface MeasurementsPanelProps {
  measurements: MeasurementsData;
  onCalculateEndpoint: () => void;
  onReset: () => void;
  isVisible: boolean;
}

export const MeasurementsPanel: React.FC<MeasurementsPanelProps> = ({
  measurements,
  onCalculateEndpoint,
  onReset,
  isVisible,
}) => {
  if (!isVisible) return null;

  const getPhStatus = (ph: number) => {
    if (ph < 6.5) return { status: "Acidic", color: "text-red-400" };
    if (ph > 7.5) return { status: "Basic", color: "text-blue-400" };
    return { status: "Neutral", color: "text-green-400" };
  };

  const phStatus = getPhStatus(measurements.ph);

  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* pH Meter */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white font-medium">pH Meter</span>
            </div>
            <div className="text-white text-xl font-bold">
              {measurements.ph.toFixed(2)}
            </div>
            <div className={`text-sm ${phStatus.color}`}>{phStatus.status}</div>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-300">Volume</span>
            <div className="text-white font-bold">
              {measurements.volume.toFixed(1)}
            </div>
            <span className="text-gray-400 text-sm">mL</span>
          </div>

          {/* Molarity */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-300">Molarity</span>
            <div className="text-white font-bold">
              {measurements.molarity.toFixed(3)}
            </div>
            <span className="text-gray-400 text-sm">M</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={onCalculateEndpoint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
          >
            Calculate Endpoint
          </Button>
          <Button
            onClick={onReset}
            variant="secondary"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm font-medium flex items-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
