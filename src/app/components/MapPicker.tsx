'use client'

import React, { useEffect, useRef } from 'react'

interface MapPickerProps {
    initialLat: number
    initialLon: number
    onChange: (lat: number, lon: number) => void
}

const MapPicker = React.memo(function MapPicker({
    initialLat,
    initialLon,
    onChange,
}: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const onChangeRef = useRef(onChange)

    useEffect(() => { onChangeRef.current = onChange }, [onChange])

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return

        import('leaflet').then(L => {
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            })

            if ((mapRef.current as any)._leaflet_id) {
                (mapRef.current as any)._leaflet_id = null
            }
            const map = L.map(mapRef.current!, {
                center: [initialLat, initialLon],
                zoom: 15,
                zoomControl: true,
            })

            L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                { attribution: 'Esri, Maxar, Earthstar Geographics', maxZoom: 19 }
            ).addTo(map)

            L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
                { maxZoom: 19, opacity: 0.8 }
            ).addTo(map)

            const marker = L.marker([initialLat, initialLon], { draggable: true })
                .addTo(map)
                .bindPopup('📍 Sensor aqui')
                .openPopup()

            marker.on('dragend', () => {
                const pos = marker.getLatLng()
                onChangeRef.current(
                    Math.round(pos.lat * 10000) / 10000,
                    Math.round(pos.lng * 10000) / 10000
                )
            })

            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng
                marker.setLatLng([lat, lng])
                onChangeRef.current(
                    Math.round(lat * 10000) / 10000,
                    Math.round(lng * 10000) / 10000
                )
            })

            mapInstance.current = map
            markerRef.current = marker
        })

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove()
                mapInstance.current = null
                markerRef.current = null
            }
        }
    }, []) // Sem dependências — inicializa UMA vez com os valores iniciais

    return (
        <div className="relative">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <div
                ref={mapRef}
                className="w-full h-56 rounded-xl overflow-hidden border border-stone-700"
            />
            <div className="absolute top-2 right-2 z-[1000] bg-black/60 backdrop-blur-sm
        rounded-lg px-2 py-1 text-[10px] font-mono text-stone-400">
                clique ou arraste o marcador
            </div>
        </div>
    )
})

export default MapPicker