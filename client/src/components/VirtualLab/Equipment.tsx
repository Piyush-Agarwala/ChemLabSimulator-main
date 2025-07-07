import React, { useState } from "react";
import {
  Beaker,
  FlaskConical,
  TestTube,
  Droplet,
  Thermometer,
} from "lucide-react";

interface EquipmentProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDrag: (id: string, x: number, y: number) => void;
  position: { x: number; y: number } | null;
  chemicals?: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    concentration: string;
  }>;
  onChemicalDrop?: (
    chemicalId: string,
    equipmentId: string,
    amount: number,
  ) => void;
}

export const Equipment: React.FC<EquipmentProps> = ({
  id,
  name,
  icon,
  onDrag,
  position,
  chemicals = [],
  onChemicalDrop,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("equipment", id);
  };

  const handleChemicalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleChemicalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleChemicalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDropping(true);

    const chemicalData = e.dataTransfer.getData("chemical");
    if (chemicalData && onChemicalDrop) {
      const chemical = JSON.parse(chemicalData);
      onChemicalDrop(chemical.id, id, chemical.volume || 25);

      // Show success feedback
      console.log(
        `Added ${chemical.volume || 25}mL of ${chemical.name} to ${name}`,
      );

      // Reset dropping animation after a delay
      setTimeout(() => setIsDropping(false), 2000);
    }
  };

  const isOnWorkbench = position && (position.x !== 0 || position.y !== 0);
  const isContainer = [
    "beaker",
    "flask",
    "burette",
    "erlenmeyer_flask",
    "conical_flask",
    "test_tubes",
    "beakers",
  ].includes(id);

  // Calculate mixed color from all chemicals
  const getMixedColor = () => {
    if (chemicals.length === 0) return "transparent";
    if (chemicals.length === 1) return chemicals[0].color;

    // Enhanced color mixing for chemical reactions
    const chemicalIds = chemicals.map((c) => c.id).sort();

    // Specific reaction colors
    if (chemicalIds.includes("hcl") && chemicalIds.includes("naoh")) {
      if (chemicalIds.includes("phenol")) {
        return "#FFB6C1"; // Pink when phenolphthalein is added to basic solution
      }
      return "#E8F5E8"; // Light green for neutralization
    }

    if (chemicalIds.includes("phenol") && chemicalIds.includes("naoh")) {
      return "#FF69B4"; // Bright pink
    }

    // Default color mixing
    let r = 0,
      g = 0,
      b = 0,
      totalAmount = 0;

    chemicals.forEach((chemical) => {
      const color = chemical.color;
      const amount = chemical.amount;

      const hex = color.replace("#", "");
      const rVal = parseInt(hex.substr(0, 2), 16);
      const gVal = parseInt(hex.substr(2, 2), 16);
      const bVal = parseInt(hex.substr(4, 2), 16);

      r += rVal * amount;
      g += gVal * amount;
      b += bVal * amount;
      totalAmount += amount;
    });

    if (totalAmount === 0) return "transparent";

    r = Math.round(r / totalAmount);
    g = Math.round(g / totalAmount);
    b = Math.round(b / totalAmount);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const getSolutionHeight = () => {
    const totalVolume = chemicals.reduce(
      (sum, chemical) => sum + chemical.amount,
      0,
    );
    return Math.min(85, (totalVolume / 100) * 85);
  };

  const getEquipmentSpecificRendering = () => {
    if (id === "conical_flask" && isOnWorkbench) {
      const hasHCl = chemicals.some((c) => c.id === "hcl");
      const hasNaOH = chemicals.some((c) => c.id === "naoh");
      const isNeutralizationReaction = hasHCl && hasNaOH;

      return (
        <div className="relative">
          {/* Enhanced Conical Flask Illustration */}
          <svg
            width="80"
            height="100"
            viewBox="0 0 80 100"
            className="drop-shadow-lg"
          >
            {/* Flask body - conical shape */}
            <path
              d="M30 20 L30 35 L15 75 L65 75 L50 35 L50 20 Z"
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#2563eb"
              strokeWidth="2"
            />
            {/* Flask neck */}
            <rect
              x="35"
              y="10"
              width="10"
              height="15"
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#2563eb"
              strokeWidth="2"
              rx="1"
            />
            {/* Flask opening */}
            <ellipse
              cx="40"
              cy="10"
              rx="5"
              ry="2"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            />

            {/* Solution in conical flask */}
            {chemicals.length > 0 && (
              <path
                d={`M${20 + chemicals.length} ${75 - getSolutionHeight() * 0.5} L${60 - chemicals.length} ${75 - getSolutionHeight() * 0.5} L65 75 L15 75 Z`}
                fill={getMixedColor()}
                opacity="0.8"
                className="transition-all duration-500"
              />
            )}

            {/* Special neutralization reaction effects */}
            {isNeutralizationReaction && (
              <g>
                {/* Heat visualization */}
                <circle
                  cx="40"
                  cy="55"
                  r="3"
                  fill="rgba(255, 165, 0, 0.6)"
                  className="animate-pulse"
                />
                <circle
                  cx="35"
                  cy="60"
                  r="2"
                  fill="rgba(255, 165, 0, 0.4)"
                  className="animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <circle
                  cx="45"
                  cy="60"
                  r="2"
                  fill="rgba(255, 165, 0, 0.4)"
                  className="animate-pulse"
                  style={{ animationDelay: "1s" }}
                />

                {/* Vigorous bubbling for neutralization */}
                {[...Array(8)].map((_, i) => (
                  <circle
                    key={i}
                    cx={25 + i * 7}
                    cy={70 - (i % 3) * 5}
                    r="1.5"
                    fill="rgba(255, 255, 255, 0.9)"
                    className="animate-bounce"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </g>
            )}

            {/* Regular bubbling for other reactions */}
            {chemicals.length > 1 && !isNeutralizationReaction && (
              <g>
                {[...Array(4)].map((_, i) => (
                  <circle
                    key={i}
                    cx={25 + i * 10}
                    cy={65 - (i % 2) * 5}
                    r="1"
                    fill="rgba(255, 255, 255, 0.7)"
                    className="animate-bounce"
                    style={{
                      animationDelay: `${i * 0.4}s`,
                      animationDuration: "2s",
                    }}
                  />
                ))}
              </g>
            )}

            {/* Volume markings */}
            <g stroke="#6b7280" strokeWidth="1" fill="#6b7280">
              <line x1="67" y1="50" x2="70" y2="50" />
              <text x="71" y="53" fontSize="5">
                250
              </text>
              <line x1="67" y1="60" x2="70" y2="60" />
              <text x="71" y="63" fontSize="5">
                150
              </text>
              <line x1="67" y1="70" x2="70" y2="70" />
              <text x="71" y="73" fontSize="5">
                50
              </text>
            </g>

            {/* Flask label */}
            <text
              x="40"
              y="90"
              textAnchor="middle"
              fontSize="7"
              fill="#374151"
              fontWeight="bold"
            >
              Conical Flask
            </text>
          </svg>

          {/* Special reaction indicator */}
          {isNeutralizationReaction && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              Neutralizing!
            </div>
          )}

          {/* Enhanced chemical composition display */}
          {chemicals.length > 0 && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-xs shadow-lg">
              <div className="text-gray-800 font-medium text-center">
                {isNeutralizationReaction
                  ? "NaOH + HCl"
                  : chemicals.map((c) => c.name.split(" ")[0]).join(" + ")}
              </div>
              {isNeutralizationReaction && (
                <div className="text-green-600 font-bold text-center text-xs">
                  → NaCl + H₂O
                </div>
              )}
              <div className="text-gray-600 text-center">
                {chemicals.reduce((sum, c) => sum + c.amount, 0).toFixed(1)} mL
              </div>
            </div>
          )}

          {/* Drop success animation */}
          {isDropping && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                ✓ Added!
              </div>
            </div>
          )}
        </div>
      );
    }

    if (id === "burette" && isOnWorkbench) {
      return (
        <div className="relative">
          {/* Burette specific rendering */}
          <div className="w-6 h-20 bg-gradient-to-b from-transparent to-blue-100 border-2 border-blue-400 rounded-b-lg relative">
            {/* Solution in burette */}
            {chemicals.length > 0 && (
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-500"
                style={{
                  backgroundColor: getMixedColor(),
                  height: `${getSolutionHeight()}%`,
                  opacity: 0.8,
                }}
              >
                {/* Liquid surface animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-30 animate-pulse"></div>
              </div>
            )}

            {/* Volume markings */}
            <div className="absolute -right-8 top-2 text-xs text-gray-600">
              50
            </div>
            <div className="absolute -right-8 top-8 text-xs text-gray-600">
              40
            </div>
            <div className="absolute -right-8 top-14 text-xs text-gray-600">
              30
            </div>

            {/* Burette tap */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
          </div>

          {/* Drop animation when chemicals are added */}
          {isDropping && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      );
    }

    if (id === "erlenmeyer_flask" && isOnWorkbench) {
      return (
        <div className="relative">
          {/* Enhanced Erlenmeyer Flask Illustration */}
          <svg
            width="80"
            height="100"
            viewBox="0 0 80 100"
            className="drop-shadow-lg"
          >
            {/* Flask body */}
            <path
              d="M25 20 L25 35 L10 70 L70 70 L55 35 L55 20 Z"
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#2563eb"
              strokeWidth="2"
            />
            {/* Flask neck */}
            <rect
              x="30"
              y="10"
              width="20"
              height="15"
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#2563eb"
              strokeWidth="2"
              rx="2"
            />
            {/* Flask opening */}
            <ellipse
              cx="40"
              cy="10"
              rx="10"
              ry="2"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            />

            {/* Solution in flask */}
            {chemicals.length > 0 && (
              <path
                d={`M${15 + chemicals.length * 2} ${70 - getSolutionHeight() * 0.4} L${65 - chemicals.length * 2} ${70 - getSolutionHeight() * 0.4} L70 70 L10 70 Z`}
                fill={getMixedColor()}
                opacity="0.8"
                className="transition-all duration-500"
              />
            )}

            {/* Volume markings */}
            <g stroke="#6b7280" strokeWidth="1" fill="#6b7280">
              <line x1="72" y1="50" x2="75" y2="50" />
              <text x="78" y="53" fontSize="6">
                100mL
              </text>
              <line x1="72" y1="60" x2="75" y2="60" />
              <text x="78" y="63" fontSize="6">
                50mL
              </text>
            </g>

            {/* Bubbling animation for reactions */}
            {chemicals.length > 1 && (
              <g>
                {[...Array(6)].map((_, i) => (
                  <circle
                    key={i}
                    cx={25 + i * 8}
                    cy={65 - (i % 2) * 5}
                    r="1.5"
                    fill="rgba(255, 255, 255, 0.7)"
                    className="animate-bounce"
                    style={{
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: "1.5s",
                    }}
                  />
                ))}
              </g>
            )}

            {/* Flask label */}
            <text
              x="40"
              y="85"
              textAnchor="middle"
              fontSize="8"
              fill="#374151"
              fontWeight="bold"
            >
              125mL Erlenmeyer
            </text>
          </svg>

          {/* Chemical composition display */}
          {chemicals.length > 0 && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-xs shadow-lg">
              <div className="text-gray-800 font-medium text-center">
                {chemicals.map((c) => c.name.split(" ")[0]).join(" + ")}
              </div>
              <div className="text-gray-600 text-center">
                {chemicals.reduce((sum, c) => sum + c.amount, 0).toFixed(1)} mL
                total
              </div>
            </div>
          )}

          {/* Drop success animation */}
          {isDropping && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                ✓ Added!
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        {icon}

        {/* Solution visualization for other containers */}
        {isContainer &&
          chemicals.length > 0 &&
          isOnWorkbench &&
          id !== "erlenmeyer_flask" && (
            <div className="absolute inset-0 flex items-end justify-center">
              <div
                className="rounded-b-lg transition-all duration-500 opacity-80"
                style={{
                  backgroundColor: getMixedColor(),
                  height: `${getSolutionHeight()}%`,
                  width: id === "beaker" ? "70%" : "60%",
                  minHeight: "8px",
                }}
              >
                {/* Enhanced liquid effects */}
                <div className="relative w-full h-full overflow-hidden rounded-b-lg">
                  {/* Surface shimmer */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-40 animate-pulse"></div>

                  {/* Bubbling animation for reactions */}
                  {chemicals.length > 1 && (
                    <div className="absolute inset-0">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white opacity-70 rounded-full animate-bounce"
                          style={{
                            left: `${15 + i * 20}%`,
                            bottom: `${5 + (i % 2) * 15}px`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: "1.5s",
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Color change animation */}
                  {chemicals.some((c) => c.id === "phenol") &&
                    chemicals.some((c) => c.id === "naoh") && (
                      <div className="absolute inset-0 bg-pink-300 opacity-50 animate-pulse rounded-b-lg"></div>
                    )}
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={isContainer ? handleChemicalDragOver : undefined}
      onDragLeave={isContainer ? handleChemicalDragLeave : undefined}
      onDrop={isContainer ? handleChemicalDrop : undefined}
      className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing border-2 relative ${
        isOnWorkbench
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 hover:border-blue-400"
      } ${isContainer && isDragOver ? "border-green-500 bg-green-50 scale-105" : ""} ${
        isDropping ? "animate-pulse" : ""
      }`}
      style={{
        position: isOnWorkbench ? "absolute" : "relative",
        left: isOnWorkbench && position ? position.x : "auto",
        top: isOnWorkbench && position ? position.y : "auto",
        zIndex: isOnWorkbench ? 10 : "auto",
        transform: isOnWorkbench ? "translate(-50%, -50%)" : "none",
      }}
    >
      {/* Enhanced drop zone indicator */}
      {isContainer && isOnWorkbench && (
        <div
          className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isDragOver ? "bg-green-500 scale-125 shadow-lg" : "bg-blue-500"
          }`}
        >
          <Droplet size={14} className="text-white" />
          {isDragOver && (
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
          )}
        </div>
      )}

      {/* Drop hint text */}
      {isContainer && isOnWorkbench && isDragOver && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium animate-bounce whitespace-nowrap shadow-lg">
          Drop chemical here!
        </div>
      )}

      {/* Drag over animation */}
      {isDragOver && (
        <div className="absolute inset-0 border-4 border-green-400 rounded-lg animate-pulse bg-green-100 opacity-50"></div>
      )}

      <div
        className={`mb-3 transition-all duration-200 relative ${
          isOnWorkbench ? "text-blue-700" : "text-blue-600"
        } ${isDragOver ? "scale-110" : ""}`}
      >
        {getEquipmentSpecificRendering()}
      </div>

      <span
        className={`text-sm font-semibold text-center transition-colors ${
          isOnWorkbench ? "text-blue-800" : "text-gray-700"
        } ${isDragOver ? "text-green-700" : ""}`}
      >
        {name}
      </span>

      {/* Enhanced chemical composition display */}
      {chemicals.length > 0 && isOnWorkbench && (
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-xs shadow-lg min-w-max">
          <div className="text-gray-800 font-medium">
            {chemicals
              .map((chemical) => chemical.name.split(" ")[0])
              .join(" + ")}
          </div>

          {/* Enhanced formula display for conical flask with NaOH + HCl reaction */}
          {id === "conical_flask" && (
            <>
              {/* Show individual chemical formulas */}
              <div className="text-blue-600 font-semibold text-center mt-1">
                {chemicals
                  .map((c) => {
                    if (c.id === "hcl") return "HCl";
                    if (c.id === "naoh") return "NaOH";
                    if (c.id === "phenol") return "C₂₀H₁₄O₄";
                    return "";
                  })
                  .filter(Boolean)
                  .join(" + ")}
              </div>

              {/* Show complete reaction equation when both NaOH and HCl are present */}
              {chemicals.some((c) => c.id === "hcl") &&
                chemicals.some((c) => c.id === "naoh") && (
                  <div className="bg-green-50 border border-green-200 rounded px-2 py-1 mt-2">
                    <div className="text-green-800 font-bold text-center text-xs">
                      Neutralization Reaction
                    </div>
                    <div className="text-green-700 font-semibold text-center mt-1">
                      NaOH + HCl → NaCl + H₂O
                    </div>
                    <div className="text-green-600 text-center text-xs mt-1">
                      Sodium hydroxide + Hydrochloric acid → Salt + Water
                    </div>
                  </div>
                )}

              {/* Show individual chemical when only one is present */}
              {chemicals.length === 1 &&
                chemicals.some((c) => c.id === "hcl") && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mt-2">
                    <div className="text-yellow-800 font-bold text-center text-xs">
                      Strong Acid
                    </div>
                    <div className="text-yellow-700 text-center text-xs">
                      Hydrochloric acid - pH &lt; 7
                    </div>
                  </div>
                )}

              {chemicals.length === 1 &&
                chemicals.some((c) => c.id === "naoh") && (
                  <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 mt-2">
                    <div className="text-blue-800 font-bold text-center text-xs">
                      Strong Base
                    </div>
                    <div className="text-blue-700 text-center text-xs">
                      Sodium hydroxide - pH &gt; 7
                    </div>
                  </div>
                )}
            </>
          )}

          <div className="text-gray-600 text-center mt-1">
            {chemicals
              .reduce((sum, chemical) => sum + chemical.amount, 0)
              .toFixed(1)}{" "}
            mL
          </div>
          {/* Color indicator */}
          <div
            className="w-full h-1 rounded-full mt-1"
            style={{ backgroundColor: getMixedColor() }}
          ></div>
        </div>
      )}

      {/* Drop success animation */}
      {isDropping && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-bounce">
            Added!
          </div>
        </div>
      )}
    </div>
  );
};

export const equipmentList = [
  { id: "beaker", name: "Beaker", icon: <Beaker size={36} /> },
  { id: "flask", name: "Erlenmeyer Flask", icon: <FlaskConical size={36} /> },
  {
    id: "burette",
    name: "Burette",
    icon: (
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        className="text-blue-600"
      >
        {/* Burette body - narrow vertical tube */}
        <rect
          x="16"
          y="4"
          width="4"
          height="24"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
          fill="rgba(59, 130, 246, 0.1)"
        />
        {/* Burette top opening */}
        <rect
          x="14"
          y="3"
          width="8"
          height="3"
          rx="1"
          stroke="currentColor"
          strokeWidth="1"
          fill="rgba(59, 130, 246, 0.2)"
        />
        {/* Volume markings */}
        <g stroke="currentColor" strokeWidth="1">
          <line x1="12" y1="8" x2="14" y2="8" />
          <line x1="12" y1="12" x2="14" y2="12" />
          <line x1="12" y1="16" x2="14" y2="16" />
          <line x1="12" y1="20" x2="14" y2="20" />
          <line x1="12" y1="24" x2="14" y2="24" />
        </g>
        {/* Burette stopcock/tap */}
        <rect
          x="15"
          y="28"
          width="6"
          height="3"
          rx="1"
          stroke="currentColor"
          strokeWidth="1"
          fill="rgba(107, 114, 128, 0.8)"
        />
        {/* Burette tip */}
        <path
          d="M17 31 L18 33 L19 31 Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="rgba(59, 130, 246, 0.3)"
        />
      </svg>
    ),
  },
  { id: "thermometer", name: "Thermometer", icon: <Thermometer size={36} /> },
];
