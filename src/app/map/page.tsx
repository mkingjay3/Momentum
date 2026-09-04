"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-16">
      <span className="loading loading-spinner loading-md text-eco-secondary" />
    </div>
  ),
});
export default function MapPage() {
  return (
    <div>
      <Map />
    </div>
  );
}
