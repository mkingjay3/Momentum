"use client";
import { useEffect, useState } from "react";
import { markerIcon } from "./LeafletMarkerFix";
import { getRoute } from "@/app/actions/getRoute";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { createClient } from "@/lib/supabase/client";
import { MapPin, AlignLeft, CalendarDays, X, Bike, Footprints, Bus, Car, Leaf } from "lucide-react";

type Level = "Beginner" | "Intermediate" | "Advanced" | "All Levels";

const LEVEL_STYLE: Record<Level, { dot: string; text: string; bg: string }> = {
  Beginner:     { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  Intermediate: { dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50"  },
  Advanced:     { dot: "bg-rose-500",    text: "text-rose-700",    bg: "bg-rose-50"   },
  "All Levels": { dot: "bg-sky-500",     text: "text-sky-700",     bg: "bg-sky-50"    },
};

interface SelectedEvent {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  description: string;
  location: string;
  level: Level;
}

interface RouteStats {
  distance: number;
  elev_gain: number;
}

interface RouteBbox {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

interface RouteResult {
  coords: [number, number][];
  stats: RouteStats;
  name: string;
  gpx: string;
  bbox: RouteBbox;
}

const SURFACE_OPTIONS = ["gravel", "sand", "dirt", "unpaved", "grass", "mud"];
const HIGHWAY_OPTIONS = ["motorway", "trunk", "primary", "secondary", "tertiary", "service", "track", "path", "footway"];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function LevelPill({ level }: { level: Level }) {
  const s = LEVEL_STYLE[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {level}
    </span>
  );
}

function parseGPX(gpxString: string): [number, number][] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxString, "application/xml");
  const coords: [number, number][] = [];
  doc.querySelectorAll("trkpt").forEach((pt) => {
    const lat = parseFloat(pt.getAttribute("lat") ?? "");
    const lon = parseFloat(pt.getAttribute("lon") ?? "");
    if (!isNaN(lat) && !isNaN(lon)) coords.push([lat, lon]);
  });
  return coords;
}

function FitBounds({ bbox }: { bbox: RouteBbox }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(
      [[bbox.min_lat, bbox.min_lon], [bbox.max_lat, bbox.max_lon]],
      { padding: [40, 40] }
    );
  }, [map, bbox]);
  return null;
}

function MapClickHandler({
  mode,
  onStartSet,
  onEndSet,
}: {
  mode: "start" | "end" | null;
  onStartSet: (lat: number, lon: number) => void;
  onEndSet: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (mode === "start") onStartSet(e.latlng.lat, e.latlng.lng);
      else if (mode === "end") onEndSet(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function co2(gPerKm: number, km: number) {
  const g = gPerKm * km;
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g.toFixed(0)} g`;
}

function CarbonComparison({ distanceKm: d }: { distanceKm: number }) {
  const saved = (170 * d / 1000).toFixed(2);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold uppercase tracking-wide opacity-50">CO₂ Emissions</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          <Leaf size={15} /> {saved} kg saved vs driving
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center p-3 rounded-lg text-center bg-emerald-50">
          <Bike size={22} className="mb-1 text-emerald-600" />
          <span className="text-sm font-medium opacity-60">Bike</span>
          <span className="text-base font-bold mt-0.5 text-emerald-600">0 g</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg text-center bg-emerald-50">
          <Footprints size={22} className="mb-1 text-emerald-600" />
          <span className="text-sm font-medium opacity-60">Walk</span>
          <span className="text-base font-bold mt-0.5 text-emerald-600">0 g</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg text-center bg-white border border-base-300">
          <Bus size={22} className="mb-1 text-gray-500" />
          <span className="text-sm font-medium opacity-60">Transit</span>
          <span className="text-base font-bold mt-0.5 text-gray-700">{co2(89, d)}</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg text-center bg-white border border-base-300">
          <Car size={22} className="mb-1 text-gray-500" />
          <span className="text-sm font-medium opacity-60">Drive</span>
          <span className="text-base font-bold mt-0.5 text-gray-700">{co2(170, d)}</span>
        </div>
      </div>
    </div>
  );
}

export default function MapView() {
  const startIcon = L.divIcon({
    className: "",
    html: `<div style="background:#3B6255;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.5)"></div>`,
    iconAnchor: [8, 8],
  });

  const endIcon = L.divIcon({
    className: "",
    html: `<div style="background:#c0392b;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.5)"></div>`,
    iconAnchor: [8, 8],
  });

  const supabase = createClient();

  const [events, setEvents] = useState<{ id: string; latitude: number; longitude: number; title: string; start: string | null; end: string | null; description: string; location: string; level: Level }[]>([]);
  const [selected, setSelected] = useState<SelectedEvent | null>(null);
  const [clickMode, setClickMode] = useState<"start" | "end" | null>(null);
  const [startPoint, setStartPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [cyclability, setCyclability] = useState(0);
  const [hills, setHills] = useState(0);
  const [angleWeight, setAngleWeight] = useState(0);
  const [onlyRoads, setOnlyRoads] = useState(true);
  const [loopAround, setLoopAround] = useState(false);
  const [excludedSurfaces, setExcludedSurfaces] = useState<string[]>([]);
  const [excludedHighways, setExcludedHighways] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("events").select("*").then(({ data }) => {
      if (data) setEvents(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSurface = (s: string) =>
    setExcludedSurfaces((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleHighway = (h: string) =>
    setExcludedHighways((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);

  const handleGetRoute = async () => {
    if (!startPoint || !endPoint) return;
    setLoading(true);
    setError(null);
    setRoute(null);
    try {
      const data = await getRoute({
        start_lat: startPoint.lat,
        start_lon: startPoint.lon,
        end_lat: endPoint.lat,
        end_lon: endPoint.lon,
        excluded_surfaces: excludedSurfaces,
        excluded_highways: excludedHighways,
        only_roads: onlyRoads,
        cyclability_factor_weight: cyclability,
        hills,
        loop_around: loopAround,
        angle_weight: angleWeight,
      });
      setRoute({
        coords: parseGPX(data.gpx),
        stats: data.stats,
        name: data.name,
        gpx: data.gpx,
        bbox: data.bbox,
      });
    } catch {
      setError("This route can't be generated.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute(null);
    setError(null);
    setClickMode(null);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-red-200 text-red-700 text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex gap-6 items-start w-[90%] max-w-5xl mx-auto mt-8">
        <div className="flex-1">
          <MapContainer
            className="z-0 w-full h-[480px] rounded-lg shadow-lg"
            center={[47.619445, -122.314713]}
            zoom={10}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler
              mode={clickMode}
              onStartSet={(lat, lon) => { setStartPoint({ lat, lon }); setClickMode(null); }}
              onEndSet={(lat, lon) => { setEndPoint({ lat, lon }); setClickMode(null); }}
            />
            {events.map((event) => (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
                icon={markerIcon}
                eventHandlers={{ click: () => setSelected(selected?.id === event.id ? null : event) }}
              />
            ))}
            {startPoint && (
              <Marker position={[startPoint.lat, startPoint.lon]} icon={startIcon}>
                <Popup>Start</Popup>
              </Marker>
            )}
            {endPoint && (
              <Marker position={[endPoint.lat, endPoint.lon]} icon={endIcon}>
                <Popup>End</Popup>
              </Marker>
            )}
            {route && route.coords.length > 0 && (
              <>
                <Polyline positions={route.coords} color="#3B6255" weight={5} opacity={0.85} />
                <FitBounds bbox={route.bbox} />
              </>
            )}
          </MapContainer>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${selected ? "w-72 opacity-100" : "w-0 opacity-0 pointer-events-none"}`}>
          {selected && (
            <div className="w-72 bg-white border border-base-300 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-eco-primary px-5 py-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-white font-semibold text-sm leading-snug pr-2">{selected.title}</h2>
                  <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white transition mt-0.5">
                    <X size={15} />
                  </button>
                </div>
                <div className="mt-2"><LevelPill level={selected.level} /></div>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <CalendarDays size={14} className="mt-0.5 shrink-0 text-eco-secondary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-eco-secondary mb-0.5">Date</p>
                    <p className="text-gray-700">{formatDate(selected.start)}</p>
                    {selected.end && <p className="text-gray-500 text-xs mt-0.5">Until {formatDate(selected.end)}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-eco-secondary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-eco-secondary mb-0.5">Location</p>
                    <p className="text-gray-700">{selected.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <AlignLeft size={14} className="mt-0.5 shrink-0 text-eco-secondary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-eco-secondary mb-0.5">About</p>
                    <p className="text-gray-700">{selected.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {clickMode && (
        <div className="mt-3 px-4 py-2 bg-eco-primary text-white text-sm rounded-full shadow">
          {clickMode === "start"
            ? "Click anywhere on the map to set your start point"
            : "Click anywhere on the map to set your end point"}
        </div>
      )}

      <div className="w-[90%] max-w-5xl bg-base-100 rounded-xl shadow-lg p-6 my-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: "#3B6255" }}>Plan a Bike Route</h2>

        <div className="flex flex-wrap gap-3 mb-5">
          <button
            className={`btn btn-sm ${clickMode === "start" ? "btn-primary" : "btn-outline btn-primary"}`}
            onClick={() => setClickMode((prev) => (prev === "start" ? null : "start"))}
          >
            {startPoint ? `Start: ${startPoint.lat.toFixed(4)}, ${startPoint.lon.toFixed(4)}` : "Set Start"}
          </button>
          <button
            className={`btn btn-sm ${clickMode === "end" ? "btn-error" : "btn-outline btn-error"}`}
            onClick={() => setClickMode((prev) => (prev === "end" ? null : "end"))}
          >
            {endPoint ? `End: ${endPoint.lat.toFixed(4)}, ${endPoint.lon.toFixed(4)}` : "Set End"}
          </button>
          {(startPoint || endPoint || route) && (
            <button className="btn btn-sm btn-ghost" onClick={handleClear}>Clear</button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Bike-Friendliness <span className="font-bold text-eco-primary">{cyclability}</span>
            </span>
            <input type="range" min={0} max={100} value={cyclability}
              onChange={(e) => setCyclability(+e.target.value)}
              className="range range-xs range-primary" />
            <div className="flex justify-between text-xs opacity-50">
              <span>Any road</span><span>Bike paths</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Avoid Hills <span className="font-bold text-eco-primary">{hills}</span>
            </span>
            <input type="range" min={0} max={100} value={hills}
              onChange={(e) => setHills(+e.target.value)}
              className="range range-xs range-primary" />
            <div className="flex justify-between text-xs opacity-50">
              <span>Ignore</span><span>Flat only</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Avoid Sharp Turns <span className="font-bold text-eco-primary">{angleWeight}</span>
            </span>
            <input type="range" min={0} max={100} value={angleWeight}
              onChange={(e) => setAngleWeight(+e.target.value)}
              className="range range-xs range-primary" />
            <div className="flex justify-between text-xs opacity-50">
              <span>Ignore</span><span>Smooth turns</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mb-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm"
              checked={onlyRoads} onChange={(e) => setOnlyRoads(e.target.checked)} />
            <span className="text-sm">Roads only (no sidewalks)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm"
              checked={loopAround} onChange={(e) => setLoopAround(e.target.checked)} />
            <span className="text-sm">Round trip</span>
          </label>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Avoid surfaces:</p>
          <div className="flex flex-wrap gap-2">
            {SURFACE_OPTIONS.map((s) => (
              <button key={s} onClick={() => toggleSurface(s)}
                className={`badge badge-md cursor-pointer transition-colors ${excludedSurfaces.includes(s) ? "badge-error text-white" : "badge-ghost"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Avoid road types:</p>
          <div className="flex flex-wrap gap-2">
            {HIGHWAY_OPTIONS.map((h) => (
              <button key={h} onClick={() => toggleHighway(h)}
                className={`badge badge-md cursor-pointer transition-colors ${excludedHighways.includes(h) ? "badge-error text-white" : "badge-ghost"}`}>
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button className="btn btn-primary" onClick={handleGetRoute}
            disabled={loading || !startPoint || !endPoint}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Get Route"}
          </button>
        </div>

        {route && (
          <div className="mt-5 p-4 bg-base-200 rounded-lg">
            <p className="font-semibold mb-3" style={{ color: "#3B6255" }}>{route.name}</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="flex flex-col">
                <span className="text-xs opacity-60 mb-0.5">Distance</span>
                <span className="font-bold text-base">{route.stats.distance.toFixed(1)} km</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs opacity-60 mb-0.5">Elevation Gain</span>
                <span className="font-bold text-base">{route.stats.elev_gain.toFixed(0)} m</span>
              </div>
            </div>
            <CarbonComparison distanceKm={route.stats.distance} />
          </div>
        )}
      </div>
    </div>
  );
}
