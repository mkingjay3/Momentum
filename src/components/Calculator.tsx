"use client";

import { useState } from "react";
import { Bike, Footprints, Bus, Car, Leaf, DollarSign } from "lucide-react";

type Mode = "Car" | "Transit" | "Walking";

const MODES: Mode[] = ["Car", "Transit", "Walking"];

const CO2_G_PER_KM: Record<Mode, number> = {
  Car: 170,
  Transit: 89,
  Walking: 0,
};

const COST_PER_MILE: Record<Mode, number> = {
  Car: 0.21,
  Transit: 0.12,
  Walking: 0.0,
};

const BIKE_COST_PER_MILE = 0.01;

const MODE_ICON: Record<Mode, React.ReactNode> = {
  Car: <Car size={16} />,
  Transit: <Bus size={16} />,
  Walking: <Footprints size={16} />,
};

const NK_DISPLAY = { fontFamily: "Helvetica Now Display Medium, Helvetica, Arial, sans-serif" };
const NK_TEXT = { fontFamily: "Helvetica Now Text, Helvetica, Arial, sans-serif" };
const NK_MED = { fontFamily: "Helvetica Now Text Medium, Helvetica, Arial, sans-serif" };

function co2Label(gPerKm: number, km: number): string {
  const g = gPerKm * km;
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g.toFixed(0)} g`;
}

function milesToKm(mi: number): number {
  return mi * 1.60934;
}

export default function Calculator() {
  const [distance, setDistance] = useState("");
  const [mode, setMode] = useState<Mode>("Car");

  const dist = parseFloat(distance) || 0;
  const km = milesToKm(dist);

  const modeCo2G = CO2_G_PER_KM[mode] * km;
  const co2Saved = (modeCo2G / 1000).toFixed(2);

  const moneySaved = (
    (COST_PER_MILE[mode] - BIKE_COST_PER_MILE) *
    dist
  ).toFixed(2);
  const showMoneySaved = mode !== "Walking";

  const maxCo2 = modeCo2G > 0 ? modeCo2G : 1;
  const modeBarPct = Math.round((modeCo2G / maxCo2) * 100);

  const bikeCostVal = BIKE_COST_PER_MILE * dist;
  const modeCostVal = COST_PER_MILE[mode] * dist;
  const maxCost = Math.max(bikeCostVal, modeCostVal, 0.01);
  const bikeCostPct = Math.round((bikeCostVal / maxCost) * 100);
  const modeCostPct = Math.round((modeCostVal / maxCost) * 100);

  return (
    <div className="px-6 py-12 max-w-2xl mx-auto">
      <h1
        className="text-[32px] font-medium leading-[1.2] mb-12"
        style={{ color: "#1b4332", ...NK_DISPLAY }}
      >
        Savings Calculator
      </h1>

      <div
        className="border p-8 space-y-8"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#b7d5c8",
          borderRadius: 0,
        }}
      >
        <div className="space-y-2">
          <label
            className="block text-[12px] font-medium leading-normal uppercase tracking-widest"
            style={{ color: "#3d7a62", ...NK_MED }}
          >
            Distance (miles)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full px-4 h-10 text-[16px] font-[400] outline-none"
            style={{
              backgroundColor: "#f0f7f4",
              color: "#1b4332",
              borderRadius: "24px",
              border: "none",
              ...NK_TEXT,
            }}
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-[12px] font-medium leading-normal uppercase tracking-widest"
            style={{ color: "#3d7a62", ...NK_MED }}
          >
            Compare biking vs.
          </label>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium leading-normal transition-colors"
                  style={{
                    backgroundColor: active ? "#1b4332" : "#ffffff",
                    color: active ? "#ffffff" : "#1b4332",
                    border: `1px solid ${active ? "#1b4332" : "#b7d5c8"}`,
                    borderRadius: "30px",
                    ...NK_MED,
                  }}
                >
                  {MODE_ICON[m]} {m}
                </button>
              );
            })}
          </div>
        </div>

        {dist > 0 && (
          <>
            <div
              className="space-y-4 pt-6"
              style={{ borderTop: "1px solid #b7d5c8" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[12px] font-medium uppercase tracking-widest"
                  style={{ color: "#3d7a62", ...NK_MED }}
                >
                  CO₂ Emissions
                </span>
                <span
                  className="flex items-center gap-1.5 text-[14px] font-medium"
                  style={{ color: "#007d48", ...NK_MED }}
                >
                  <Leaf size={13} />
                  {co2Saved} kg saved vs {mode.toLowerCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="flex flex-col items-center p-4 text-center"
                  style={{ backgroundColor: "#f0f7f4" }}
                >
                  <Bike
                    size={20}
                    className="mb-1"
                    style={{ color: "#007d48" }}
                  />
                  <span
                    className="text-[12px] font-medium mt-1"
                    style={{ color: "#3d7a62", ...NK_MED }}
                  >
                    Bike
                  </span>
                  <span
                    className="text-[16px] font-medium mt-1"
                    style={{ color: "#007d48", ...NK_DISPLAY }}
                  >
                    0 g
                  </span>
                </div>
                <div
                  className="flex flex-col items-center p-4 text-center"
                  style={{ backgroundColor: "#f0f7f4" }}
                >
                  <span style={{ color: "#1b4332" }}>{MODE_ICON[mode]}</span>
                  <span
                    className="text-[12px] font-medium mt-1"
                    style={{ color: "#3d7a62", ...NK_MED }}
                  >
                    {mode}
                  </span>
                  <span
                    className="text-[16px] font-medium mt-1"
                    style={{ color: "#1b4332", ...NK_DISPLAY }}
                  >
                    {co2Label(CO2_G_PER_KM[mode], km)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className="text-[12px] font-medium w-12"
                    style={{ color: "#3d7a62", ...NK_MED }}
                  >
                    Bike
                  </span>
                  <div
                    className="flex-1 h-2 rounded-none overflow-hidden"
                    style={{ backgroundColor: "#d4ebe3" }}
                  >
                    <div
                      className="h-2 transition-all"
                      style={{ width: "0%", backgroundColor: "#007d48" }}
                    />
                  </div>
                  <span
                    className="text-[12px] w-10 text-right"
                    style={{ color: "#3d7a62" }}
                  >
                    0 g
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[12px] font-medium w-12"
                    style={{ color: "#3d7a62", ...NK_MED }}
                  >
                    {mode}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-none overflow-hidden"
                    style={{ backgroundColor: "#d4ebe3" }}
                  >
                    <div
                      className="h-2 transition-all"
                      style={{
                        width: `${modeBarPct}%`,
                        backgroundColor: "#1b4332",
                      }}
                    />
                  </div>
                  <span
                    className="text-[12px] w-10 text-right"
                    style={{ color: "#3d7a62" }}
                  >
                    {co2Label(CO2_G_PER_KM[mode], km)}
                  </span>
                </div>
              </div>
            </div>

            {showMoneySaved && (
              <div
                className="space-y-4 pt-6"
                style={{ borderTop: "1px solid #b7d5c8" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[12px] font-medium uppercase tracking-widest"
                    style={{ color: "#3d7a62", ...NK_MED }}
                  >
                    Money Savings
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-[14px] font-medium"
                    style={{ color: "#007d48", ...NK_MED }}
                  >
                    <DollarSign size={13} />
                    You save ${moneySaved} vs {mode.toLowerCase()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[12px] font-medium w-12"
                      style={{ color: "#3d7a62", ...NK_MED }}
                    >
                      Bike
                    </span>
                    <div
                      className="flex-1 h-2 rounded-none overflow-hidden"
                      style={{ backgroundColor: "#d4ebe3" }}
                    >
                      <div
                        className="h-2 transition-all"
                        style={{
                          width: `${bikeCostPct}%`,
                          backgroundColor: "#007d48",
                        }}
                      />
                    </div>
                    <span
                      className="text-[12px] w-14 text-right"
                      style={{ color: "#3d7a62" }}
                    >
                      ${bikeCostVal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[12px] font-medium w-12"
                      style={{ color: "#3d7a62", ...NK_MED }}
                    >
                      {mode}
                    </span>
                    <div
                      className="flex-1 h-2 rounded-none overflow-hidden"
                      style={{ backgroundColor: "#d4ebe3" }}
                    >
                      <div
                        className="h-2 transition-all"
                        style={{
                          width: `${modeCostPct}%`,
                          backgroundColor: "#1b4332",
                        }}
                      />
                    </div>
                    <span
                      className="text-[12px] w-14 text-right"
                      style={{ color: "#3d7a62" }}
                    >
                      ${modeCostVal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {dist === 0 && (
          <p
            className="text-[14px] font-[400] pt-6"
            style={{
              color: "#3d7a62",
              borderTop: "1px solid #b7d5c8",
              ...NK_TEXT,
            }}
          >
            Enter a distance above to see your CO₂ and money savings.
          </p>
        )}
      </div>
    </div>
  );
}
