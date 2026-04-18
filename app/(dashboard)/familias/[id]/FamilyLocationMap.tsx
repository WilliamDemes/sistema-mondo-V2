"use client";

import React, { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import styles from "./FamilyLocationMap.module.css";

// Para evitar o bug natural do Leaflet com caminhos relativos ao compilar no Next.js
// geramos um ícone customizado de bolinha (estilo tableau/powerBI) renderizado puramente via CSS.
const customMarkerIcon = new L.DivIcon({
  className: "custom-leaflet-marker",
  html: `<div style="background-color: #009999; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFF; box-shadow: 0 2px 4px rgba(0,0,0,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface FamilyLocationMapProps {
  lat: number;
  lng: number;
  familyName: string;
}

export default function FamilyLocationMap({ lat, lng, familyName }: FamilyLocationMapProps) {
  const position: [number, number] = [lat, lng];

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>Georreferenciamento da Família</h3>
          <p className={styles.subtitle}>Posição residencial informada. Centralizado para inteligência e rotas locais.</p>
        </div>
        
        <a 
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.routeButton}
          title="Abrir diretamente no Aplicativo ou Web do Google Maps"
        >
          <MapPin size={16} />
          Traçar Rota Logística
        </a>
      </div>

      <div className={styles.mapWrapper}>
        <MapContainer 
          center={position} 
          zoom={16} 
          scrollWheelZoom={false} // Evita rolar a página sem querer
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        >
          {/* Tileset CartoDB Voyager: estilo extremamente clean (creme/verde claro) igual referencias de BI */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={position} icon={customMarkerIcon}>
            <Popup>
              Residência da Família <b>{familyName}</b>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
