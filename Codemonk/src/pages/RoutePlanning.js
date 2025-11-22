import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  LocalHospital,
  MyLocation,
  Navigation,
  Warning,
  Send,
  Save,
  Refresh,
  LocationOn,
  Lightbulb,
  Speed,
  AccessTime,
} from '@mui/icons-material';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';

const RoutePlanning = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ambulanceId, setAmbulanceId] = useState('');
  const [pickupId, setPickupId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [routeType, setRouteType] = useState('fastest');
  const [calculating, setCalculating] = useState(false);
  const [route, setRoute] = useState(null);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);

  // Mock data - replace with API calls
  const ambulances = [
    { id: 'AMB-001', name: 'Ambulance 001 - Advanced Life Support', status: 'available', lat: 28.6139, lng: 77.2090 },
    { id: 'AMB-002', name: 'Ambulance 002 - Basic Life Support', status: 'available', lat: 28.6200, lng: 77.2150 },
    { id: 'AMB-003', name: 'Ambulance 003 - Advanced Life Support', status: 'available', lat: 28.6100, lng: 77.2000 },
  ];

  const emergencies = [
    { id: 'EMG-001', name: 'Heart Attack - Connaught Place', lat: 28.6289, lng: 77.2065 },
    { id: 'EMG-002', name: 'Traffic Accident - India Gate', lat: 28.6129, lng: 77.2295 },
    { id: 'EMG-003', name: 'Breathing Problem - Karol Bagh', lat: 28.6517, lng: 77.1909 },
  ];

  const hospitals = [
    { id: 'HOSP-001', name: 'AIIMS Hospital', lat: 28.5672, lng: 77.2100 },
    { id: 'HOSP-002', name: 'Safdarjung Hospital', lat: 28.5676, lng: 77.2063 },
    { id: 'HOSP-003', name: 'Ram Manohar Lohia Hospital', lat: 28.6281, lng: 77.2136 },
  ];

  const mapContainerStyle = {
    width: '100%',
    height: '600px',
  };

  const center = {
    lat: 28.6139,
    lng: 77.2090,
  };

  const handleCalculateRoute = async () => {
    if (!ambulanceId || !pickupId || !destinationId) {
      return;
    }

    setCalculating(true);

    const ambulance = ambulances.find(a => a.id === ambulanceId);
    const emergency = emergencies.find(e => e.id === pickupId);
    const hospital = hospitals.find(h => h.id === destinationId);

    // Simulate API call
    setTimeout(() => {
      // Calculate using Google Directions
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route({
        origin: { lat: ambulance.lat, lng: ambulance.lng },
        destination: { lat: hospital.lat, lng: hospital.lng },
        waypoints: [{ location: { lat: emergency.lat, lng: emergency.lng }, stopover: true }],
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'bestguess',
        },
      }, (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          
          const leg1 = result.routes[0].legs[0];
          const leg2 = result.routes[0].legs[1];
          
          setRoute({
            totalDistance: ((leg1.distance.value + leg2.distance.value) / 1000).toFixed(1),
            totalTime: Math.ceil((leg1.duration.value + leg2.duration.value) / 60),
            segments: [
              {
                name: 'To Emergency Scene',
                distance: (leg1.distance.value / 1000).toFixed(1),
                time: Math.ceil(leg1.duration.value / 60),
              },
              {
                name: 'To Hospital',
                distance: (leg2.distance.value / 1000).toFixed(1),
                time: Math.ceil(leg2.duration.value / 60),
              },
            ],
            recommendations: [
              'Consider alternative route due to traffic congestion on Main Road.',
              'Hospital emergency capacity is currently at 75%.',
              'Weather conditions are favorable for transport.',
              'Recommended ambulance speed: 60-70 km/h.',
            ],
          });
        }
        setCalculating(false);
      });
    }, 1000);
  };

  const handleDispatch = () => {
    alert('Ambulance dispatched successfully!');
  };

  const handleSaveRoute = () => {
    alert('Route saved successfully!');
  };

  const handleClearRoute = () => {
    setRoute(null);
    setDirections(null);
    setAmbulanceId('');
    setPickupId('');
    setDestinationId('');
  };

  const formatETA = (minutes) => {
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + minutes);
    return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <TopNavBar onMenuClick={() => setMobileOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: { xs: 8, md: 0 },
          ml: { md: '260px' },
        }}
      >
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Route Planning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculate optimal routes with traffic and weather analysis
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleClearRoute}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Clear Route
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Route Planner Form */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🚑 Route Planner
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select ambulance, pickup location, and destination
              </Typography>

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Ambulance</InputLabel>
                  <Select
                    value={ambulanceId}
                    label="Select Ambulance"
                    onChange={(e) => setAmbulanceId(e.target.value)}
                  >
                    {ambulances.map((amb) => (
                      <MenuItem key={amb.id} value={amb.id}>
                        {amb.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Pickup Location (Emergency)</InputLabel>
                  <Select
                    value={pickupId}
                    label="Pickup Location (Emergency)"
                    onChange={(e) => setPickupId(e.target.value)}
                  >
                    {emergencies.map((emg) => (
                      <MenuItem key={emg.id} value={emg.id}>
                        {emg.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Destination (Hospital)</InputLabel>
                  <Select
                    value={destinationId}
                    label="Destination (Hospital)"
                    onChange={(e) => setDestinationId(e.target.value)}
                  >
                    {hospitals.map((hosp) => (
                      <MenuItem key={hosp.id} value={hosp.id}>
                        {hosp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Route Type</InputLabel>
                  <Select
                    value={routeType}
                    label="Route Type"
                    onChange={(e) => setRouteType(e.target.value)}
                  >
                    <MenuItem value="fastest">Fastest Route</MenuItem>
                    <MenuItem value="shortest">Shortest Route</MenuItem>
                    <MenuItem value="avoid-traffic">Avoid Traffic</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Navigation />}
                  onClick={handleCalculateRoute}
                  disabled={!ambulanceId || !pickupId || !destinationId || calculating}
                >
                  {calculating ? 'Calculating...' : 'Calculate Route'}
                </Button>
              </Box>
            </Paper>

            {/* Map Legend */}
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e5e7eb' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Map Legend
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box display="flex" alignItems="center">
                  <Box sx={{ width: 16, height: 16, bgcolor: '#3b82f6', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2">Ambulances</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box sx={{ width: 16, height: 16, bgcolor: '#f59e0b', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2">Emergency Location</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box sx={{ width: 16, height: 16, bgcolor: '#ef4444', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2">Hospitals</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Middle Column - Map */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ mb: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {calculating && <LinearProgress />}
              <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={12}
                  onLoad={setMap}
                >
                  {/* Ambulance Markers */}
                  {ambulances.map((amb) => (
                    <Marker
                      key={amb.id}
                      position={{ lat: amb.lat, lng: amb.lng }}
                      icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                      }}
                    />
                  ))}

                  {/* Emergency Markers */}
                  {emergencies.map((emg) => (
                    <Marker
                      key={emg.id}
                      position={{ lat: emg.lat, lng: emg.lng }}
                      icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                      }}
                    />
                  ))}

                  {/* Hospital Markers */}
                  {hospitals.map((hosp) => (
                    <Marker
                      key={hosp.id}
                      position={{ lat: hosp.lat, lng: hosp.lng }}
                      icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      }}
                    />
                  ))}

                  {/* Route */}
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: '#3b82f6',
                          strokeWeight: 5,
                        },
                        suppressMarkers: true,
                      }}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </Paper>

            {/* Route Details */}
            {route && (
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Route Summary
                </Typography>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Distance
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="#1e40af">
                        {route.totalDistance} km
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Time
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="#92400e">
                        {route.totalTime} min
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, bgcolor: '#d1fae5', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        ETA
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="#047857">
                        {formatETA(route.totalTime)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Segments */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Route Segments
                </Typography>
                <Box sx={{ mb: 3 }}>
                  {route.segments.map((segment, index) => (
                    <Card key={index} sx={{ mb: 1.5, bgcolor: '#f9fafb' }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {segment.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {segment.distance} km
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="body1" fontWeight={500}>
                              {segment.time} min
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ETA: {formatETA(index === 0 ? segment.time : route.segments[0].time + segment.time)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* AI Recommendations */}
                <Box sx={{ p: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 1, mb: 3 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Lightbulb sx={{ color: '#3b82f6', mr: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      AI Recommendations
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {route.recommendations.map((rec, index) => (
                      <Typography key={index} component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={handleSaveRoute}
                    fullWidth
                  >
                    Save Route
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleDispatch}
                    fullWidth
                  >
                    Dispatch
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default RoutePlanning;
