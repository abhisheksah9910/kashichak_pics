import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView({ places }) {
    // Default center (India)
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    return (
        <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-terracotta-100 shadow-soft z-0 relative">
            <MapContainer center={defaultCenter} zoom={defaultZoom} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {places.map((place) => {
                    if (place.coordinates && place.coordinates.lat && place.coordinates.lng) {
                        return (
                            <Marker key={place._id} position={[place.coordinates.lat, place.coordinates.lng]}>
                                <Popup>
                                    <div className="text-center">
                                        <h3 className="font-semibold text-sm mb-1">{place.name}</h3>
                                        <p className="text-xs text-gray-500 mb-2">
                                            {[place.area, place.district, place.state].filter(Boolean).join(', ')}
                                        </p>
                                        <Link to={`/places/${place.slug}`} className="text-terracotta-600 text-xs hover:underline">
                                            View Place
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}
            </MapContainer>
        </div>
    );
}
