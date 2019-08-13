export const createMarker = (map, position, markerOpts = {}) => {
  // The marker, positioned at position
  return new window.google.maps.Marker({
    position,
    map,
    ...markerOpts,
  });
};

export const initMap = (lat, lng, markerOpts = {}) => {
  const position = {lat, lng};
  // The map, centered at position
  const map = new window.google.maps.Map(
    document.getElementById('map'),
    {zoom: 4, center: position},
  );
  const marker = createMarker(map, position, markerOpts);
  return {map, marker};
};

export const includeScript = () => {
  if (!window.google) {
    const mapscript = document.createElement('script');
    mapscript.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCVIVxFKjMJkW74mqK1TxzLflgZeTxMKCQ&callback=initMap');
    document.head.appendChild(mapscript);
  }
};

export const fromGeopoint = (geopoint) => {
  const newgeopoint = Object.assign({}, geopoint);
  newgeopoint.latitude /= 10 ** 7;
  newgeopoint.longitude /= 10 ** 7;
  return newgeopoint;
};

export const toGeopoint = (geopoint) => {
  const newgeopoint = Object.assign({}, geopoint);
  newgeopoint.latitude = Math.round((10 ** 7) * newgeopoint.latitude);
  newgeopoint.longitude = Math.round((10 ** 7) * newgeopoint.longitude);
  return newgeopoint;
};
