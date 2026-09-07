import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import { Loader2, MapPin, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { reverseGeocode, searchLocation } from '@/api/nominatim';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

// Fix for default marker icon in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const formatAddressFromReverse = data => {
  const lat = parseFloat(data?.lat);
  const lon = parseFloat(data?.lon);

  if (!data?.address) {
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
    return '';
  }

  const parts = [
    data.address.house_number,
    data.address.road || data.address.pedestrian || data.address.street,
    data.address.quarter ||
      data.address.neighbourhood ||
      data.address.suburb ||
      data.address.residential,
    data.address.city_district || data.address.district || data.address.county,
    data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.hamlet,
    data.address.state || data.address.province,
    data.address.country,
  ].filter(Boolean);

  return [...new Set(parts)].join(', ');
};

// Component to handle map center updates
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

const LocationMarker = ({
  position,
  setPosition,
  onPickLatLng,
}) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPickLatLng(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const LocationPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  initialLocation,
}) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([21.0285, 105.8542]); // Default Hanoi

  const reverseAbortRef = useRef(null);
  const searchAbortRef = useRef(null);
  const reverseReqIdRef = useRef(0);
  const searchReqIdRef = useRef(0);

  // Default to Hanoi, Vietnam if no location
  // const defaultCenter = [21.0285, 105.8542];

  useEffect(() => {
    if (!isOpen) {
      reverseAbortRef.current?.abort();
      searchAbortRef.current?.abort();
      return;
    }

    if (isOpen) {
      // For now, we start fresh or at default, but keep the initial text address if present
      setPosition(null);
      setAddress(initialLocation || '');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, initialLocation]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchAddressByLatLng = useCallback(async latlng => {
    const lat = latlng?.lat;
    const lon = latlng?.lng;

    reverseAbortRef.current?.abort();
    const ac = new AbortController();
    reverseAbortRef.current = ac;

    const reqId = ++reverseReqIdRef.current;

    setIsLoading(true);
    try {
      const data = await reverseGeocode({ lat, lon }, { signal: ac.signal });
      if (reqId !== reverseReqIdRef.current) return;

      const pretty = formatAddressFromReverse(data);
      setAddress(pretty || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching address:', error);
      }

      if (reqId === reverseReqIdRef.current) {
        setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } finally {
      if (reqId === reverseReqIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    searchAbortRef.current?.abort();
    const ac = new AbortController();
    searchAbortRef.current = ac;

    const reqId = ++searchReqIdRef.current;
    try {
      const data = await searchLocation(searchQuery, { signal: ac.signal });
      if (reqId !== searchReqIdRef.current) return;
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Error searching location:', error);
      }
    } finally {
      if (reqId === searchReqIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  const handleSelectSearchResult = result => {
    searchAbortRef.current?.abort();
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const newPos = { lat, lng: lon };

    setPosition(newPos);
    setMapCenter([lat, lon]);
    setAddress(result.display_name); // Or construct it properly like in LocationMarker
    setSearchResults([]); // Clear results
    setSearchQuery(''); // clear query or keep it? maybe user wants to see what they searched
  };

  const handleConfirm = () => {
    if (address) {
      onSelect(address);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">Choose Location</DialogTitle>
        <DialogDescription className="sr-only">
          Interactive map to pick a location
        </DialogDescription>

        {/* Header */}
        <div className="z-10 flex items-center justify-between border-b border-border bg-background p-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="text-primary" size={20} />
            Choose Location
          </h3>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white dark:bg-neutral-900 z-20 relative">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Input
                type="text"
                aria-label="Search location"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search city, country..."
                className="h-9 rounded-xl bg-muted/50 pl-10 pr-4"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              {isSearching && (
                <Loader2
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
                  size={18}
                />
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-60 overflow-y-auto z-50">
              {searchResults.map(result => (
                <Button
                  key={result.place_id}
                  variant="ghost"
                  onClick={() => handleSelectSearchResult(result)}
                  className="h-auto w-full justify-start rounded-none px-4 py-3 text-left border-b border-border last:border-0"
                >
                  <span className="w-full min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">
                      {result.display_name.split(',')[0]}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {result.display_name}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="h-[400px] relative w-full">
          <MapContainer
            center={mapCenter}
            zoom={12}
            className="z-0 h-full w-full"
          >
            <RecenterMap center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              setPosition={setPosition}
              onPickLatLng={fetchAddressByLatLng}
            />
          </MapContainer>

          {/* Instructions Overlay */}
          {!position && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/90 px-4 py-2 rounded-full shadow-lg text-sm font-medium z-[400] pointer-events-none whitespace-nowrap">
              Click on the map to select location
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <MapPin className="text-neutral-500 shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 uppercase font-semibold">
                Selected Location
              </p>
              <p className="text-sm font-medium text-black dark:text-white truncate">
                {isLoading
                  ? 'Fetching address...'
                  : address || 'No location selected'}
              </p>
            </div>
            {isLoading && (
              <Loader2 className="animate-spin text-neutral-400" size={20} />
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-xl text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={!address || isLoading}
              className="rounded-xl px-6 text-sm font-bold"
            >
              {isLoading && <Spinner />}
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerModal;
