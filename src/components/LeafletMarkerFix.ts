import L from 'leaflet'

export const markerIcon = L.divIcon({
  className: "",
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="37">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24S24 19.2 24 12C24 5.4 18.6 0 12 0z"
        fill="#3B6255"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `,
  iconSize: [25, 37],
  iconAnchor: [12, 37],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})