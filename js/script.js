const createLocationsOnMap = (locations) => {
  return locations.map((location) => {
    const uniqueId = Math.random();

    simplemaps_countrymap_mapdata.locations[`heatmap heatmap_${uniqueId}`] = {...location, name: location.city };
    return { ...location, uniqueId };
  });
}


const transformCoordinatesToPixels = (dataPoints, container) => {
  const mapBoundingClientRect = container.getBoundingClientRect();

  return dataPoints.map(({ uniqueId, value }) => {
      const element = document.getElementsByClassName("heatmap_" + uniqueId)[0];
      const getBoundingClientRect = element.getBoundingClientRect();

      return {
          x: getBoundingClientRect.x - mapBoundingClientRect.x + getBoundingClientRect.width / 2,
          y: getBoundingClientRect.y - mapBoundingClientRect.y + getBoundingClientRect.height / 2,
          value: 100,
      };
  });
};

const storeData = (heatmapInstance, container) => {
  return (locations) => {
      const coodirnates = transformCoordinatesToPixels(locations, container);

      heatmapInstance.setData({
          min: 0,
          max: 100,
          data: coodirnates,
      });
  };
};

const createElement = (el, container) => {
    const element = document.createElement("option");
    element.setAttribute("value", el.id);
    element.textContent = el.name;

    container.appendChild(element);
};

const createElements = (elements, container) => {

  while (container.childNodes.length) {
      container.removeChild(container.lastChild);
  }

//   console.log(elements)

  if (elements && elements.length === 0) {
      createElement({ id: "NO_EXISTS", name: "Sin ciudades" }, container);
  } else if (elements) {
      createElement({ id: "NO_EXISTS", name: "Seleccionar municipio." }, container);
      elements.forEach(el => createElement(el, container));
  } else {
      createElement({ id: "NO_EXISTS", name: "Seleccionar municipio." }, container);
  }
};

const removeSelected = (nodes, id) => {
    [...nodes].map((el) => {
        if (el.getAttribute("value") === id) {
            el.setAttribute("selected", "");
        } else {
            el.removeAttribute("selected");
        }
    });
}

function createHeatmap(data, { container, stateInput, townInput, heatmap: initialConfigurationsHeatmap }) {
  const locations = createLocationsOnMap(data);

  const statesId = Object.entries(simplemaps_countrymap_mapdata.state_specific)
                    .map(([key, { name }]) => ({ id: key, name }));

  const towsAvailable = (() => {
    const towns = {};
    
    statesId.forEach(({ name, id }) => {
        towns[id] = data
                    .filter((el) => el.admin_name == name)
                    .map(({ city: name }) => ({ id: name, name }));
    });
    return towns;
  })();

  const InitialConfigurationsHeatmap = {
      container,
      radius: 10,
      maxOpacity: 0.5,
      minOpacity: 0,
      blur: 0.75,

      ...initialConfigurationsHeatmap,
  };

  //   Render first locations
  createElements(statesId, stateInput);

  /**
   * This function is called after the map has finished loading.
   */
  simplemaps_countrymap.hooks.complete = () => {
    // create heatmap with configuration  
    let heatmapInstance = h337.create(InitialConfigurationsHeatmap);
    let setData = storeData(heatmapInstance, container);

    setData(locations);

    simplemaps_countrymap.hooks.zooming_complete = () => setData(locations);
    simplemaps_countrymap.hooks.zoomable_click_state = (id) => {
        createElements(towsAvailable[id], townInput);
        removeSelected(stateInput.childNodes, id);
    };
   
    // State change event
    stateInput.addEventListener("change", () => {    
        createElements(towsAvailable[stateInput.value], townInput);
        removeSelected(stateInput.childNodes, stateInput.value);
        if(stateInput.value != "NO_EXISTS") {
            simplemaps_countrymap.state_zoom(stateInput.value);
        } else {
            simplemaps_countrymap.back();
        }
    });

    // Town change event
    townInput.addEventListener("change", () => {
        setData(locations.filter((el) => el.city == townInput.value)); 
    });
  };
}