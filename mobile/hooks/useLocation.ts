import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { updateLocation } from '../services/donor';

interface LocationState {
  location: Location.LocationObject | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage location permissions, fetch current position,
 * and send location updates to the backend.
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
  });

  const refreshLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({
          location: null,
          loading: false,
          error: 'Location permission denied',
        });
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setState({ location, loading: false, error: null });

      // Send to backend
      try {
        await updateLocation(
          location.coords.latitude,
          location.coords.longitude
        );
      } catch (err) {
        console.error('[Location] Failed to send to backend:', err);
      }
    } catch (error: any) {
      setState({
        location: null,
        loading: false,
        error: error.message || 'Failed to get location',
      });
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return { ...state, refreshLocation };
}
