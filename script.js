const map = document.getElementById("map")

// create configuration object
const config = {
  container: map,
  radius: 70,
  maxOpacity: .5,
  minOpacity: 0,
  blur: .75
};

// create heatmap with configuration
const heatmapInstance = h337.create(config);

const createLocationsOnMap = (locations, created) => {
  const locationsOnMap = [];
  
  locations.forEach((element) => {

    const uniqueId = Math.random()
    simplemaps_countrymap_mapdata.locations[`heatmap_${uniqueId}`] = {
      ...element,
      name: "Heatmap",
      opacity: "0"
    }
    locationsOnMap.push([uniqueId, element.value]);
  })

  simplemaps_countrymap.load()
  simplemaps_countrymap.hooks.complete = () => created(locationsOnMap);
}

const transformCoordinatesToPixels = (dataPoints) => {

  return dataPoints.map( ([uniqueId, value]) => {

    const element = document.getElementsByClassName("sm_location_heatmap_" + uniqueId)[0];
    const getBoundingClientRect = element.getBoundingClientRect();
      
    return {
      x: getBoundingClientRect.x - map.getBoundingClientRect().x + (getBoundingClientRect.width/2), 
      y: getBoundingClientRect.y - map.getBoundingClientRect().y + (getBoundingClientRect.height/2), 
      value
    }
  })
}

const renderHeatPoints = (points) => {
  heatmapInstance.setData({
    max: 100,
    min: 0,
    data: points
  })
}

document.getElementById("datapoints-input").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const textarea = document.getElementById("data");
  const parseData = JSON.parse(textarea.value);
  
  createLocationsOnMap(parseData, (locations) => {
    const points = transformCoordinatesToPixels(locations);
    renderHeatPoints(points);
  })
})



// Testing

// const initialData = [];

// function getRandomArbitrary(min, max) {
//   return Math.random() * (max - min) + min;
// }

// for(let i = 15; i >= 15 && i <= 40; i += 2) {
//   for(let j = -120; j >= -120 && j <= -70; j += 2) {
//     initialData.push({
//       lat: i,
//       lng: j,
//       value: getRandomArbitrary(-100, 80)
//     })
//   } 
// }

// createLocationsOnMap(initialData, (locations) => {
//   const points = transformCoordinatesToPixels(locations);
//   renderHeatPoints(points)
// })