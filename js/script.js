const getColor = (value) => {
    switch (value) {
        case "certificate":
            return "#4DBF3B"
        case "denied":
            return "#F83527"
        case "in_progress":
            return "#FC541F"
        case "uncertified":
            return "#F83527"
        default:
            break;
    }
}

const createLocationsOnMap = (locations) => {
    const locationsObject = {};

    locations.forEach((location) => {
        const key = `map_point point_${Math.random()}`;
        locationsObject[key] = {
            ...location,
            key,
            opacity: 1,
            border_color: "#f3f2f0",
            border: 1.5,
            type: "circle",
            color: getColor(location.status)
        };
    });

    simplemaps_countrymap_mapdata.locations = locationsObject;
}

const mapInitialData = (data, statesIds) => {
    let objectNewData = {};

    /** Map data */
    Object.entries(statesIds).map(([key, { name }]) => {
        objectNewData[key] = {
            name,
            penitentiaries: Object.values(data).filter((town) => town.state === name)
        }
    })
    
    const hideElements = (search, showFunction) => {
        if(search) {
            Object.entries(data).forEach(([_, el]) => el.hide = "yes");
            showFunction();
        } else {
            Object.entries(data).forEach(([_, el]) => el.hide = "no");
        }

        simplemaps_countrymap.refresh();
    }
    
    /** Exposed API */
    return  (state = undefined, penitentiary = undefined) => {
        try {
            if(state && penitentiary) {

                const search = objectNewData[state].penitentiaries.filter(({ name }) => name === penitentiary )[0];
                hideElements(search, () => data[search.key].hide = "no")

                return search;

            } else if (state) {
                const search = objectNewData[state]
                hideElements(search, () => {
                    search.penitentiaries.forEach(({key}) => {
                        data[key].hide = "no"
                    })
                })

                return objectNewData[state].penitentiaries || [];

            } else {

                /** A lot of refresh useless */
                Object.entries(data).map(([_, el]) => el.hide = "no");
                simplemaps_countrymap.refresh();

                return Object.entries(objectNewData).map(([key, {name}]) =>{
                    return {
                        key, name
                    }
                });
            }   
        } catch (error) {
            simplemaps_countrymap.back()
        }
    }

};

const createOptionElement = ({key, name}) => {
    const option = document.createElement("option");
    option.setAttribute("value", key && key.length == 7 ? key : name);
    option.textContent = name;

    return option;
}

const insertOptionsElements = (optionsData = [], target, type = "municipio") => {

    /** Remove all options */
    while(target.childNodes.length) {
        target.removeChild(target.lastChild)
    }

    /** Insert new options */
    if(optionsData.length > 0) {
        target.appendChild(createOptionElement({ id: "", name: `Seleccionar ${type}.` }));
        target.append(...optionsData.map(createOptionElement));
    } else {
        target.appendChild(createOptionElement({ id: "", name: `Sin ${type}.` }));
    }
}

const removeSelected = (nodes, id) => {
    [...nodes].map((el) => {
        if (el.getAttribute("value") === id) {
            el.setAttribute("selected", "");
        } else {
            el.removeAttribute("selected");
        }
    });
}

function createHeatmap(data, { stateInput, townInput }) {
    createLocationsOnMap(data);
    simplemaps_countrymap.load()
    simplemaps_countrymap.hooks.complete = () => {

        const filter =  mapInitialData(simplemaps_countrymap_mapdata.locations, simplemaps_countrymap_mapdata.state_specific);
        const initialStates = filter();

        // Render first locations
        insertOptionsElements(initialStates, stateInput);

        const handlerStateInput = () => {
            const penitentiaries = filter(stateInput.value);
            insertOptionsElements(penitentiaries, townInput);
            simplemaps_countrymap.state_zoom(stateInput.value);
        }

        const handlerPenitentiariesInput = () => {
            filter(stateInput.value, townInput.value);
        }

        simplemaps_countrymap.hooks.back = () => {
            filter()
            insertOptionsElements([], townInput);
        };
        simplemaps_countrymap.hooks.zoomable_click_state = (id) => {
            removeSelected(stateInput.childNodes, id);
            handlerStateInput();
        } ; 	
        
        stateInput.addEventListener("change", handlerStateInput);
        townInput.addEventListener("change", handlerPenitentiariesInput)
    };
}

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

// -----------------------------------------------

// copy(datos.map((el, index) => {
//     return {
//         name: el.name + " " + index + 100,
//         description: el.description,
//         state: el.admin_name,
//         status: el.value,
//         city: el.city,
//         lat: el.lat,
//         lng: el.lng
//     }
// }))

// ----------------------------------------------------

// const createLocationsOnMap = (locations) => {
//     const locationsObject = {};
//     const ids = [];

//     const getColor = (value) => {
//         switch (value) {
//             case "certificate":
//                 return "#4DBF3B"
//             case "denied":
//                 return "#F83527"
//             case "in_progress":
//                 return "#FC541F"
//             case "uncertified":
//                 return "#F83527"
//             default:
//                 break;
//         }
//     }

//     locations.forEach((location) => {
//         const uniqueId = Math.random();
//         locationsObject[`heatmap heatmap_${uniqueId}`] = {
//             ...location,
//             opacity: 1,
//             border_color: "#f3f2f0",
//             border: 1.5,
//             type: "circle",
//             color: getColor(location.value)
//         };
//         ids.push({ id: uniqueId, location})
//     });

//     simplemaps_countrymap_mapdata.locations = locationsObject;

//     return ids;
// }

// const storeData = (heatmapInstance, container, maxLocations) => {
//   return (locations) => {
//         if(locations.length < maxLocations.length && !locations.length == 0){
//             const allRects = document.querySelectorAll(".sm_location_heatmap");
//             const rect = document.querySelector(`.heatmap_${CSS.escape(locations[0].uniqueId)}`);
    
//             [...allRects].map(el => el.style.visibility = "hidden");
//             rect.style.visibility = "visible";
//         } else {
//             const allRects = document.querySelectorAll(".sm_location_heatmap");
//             [...allRects].map(el => el.style.visibility = "visible");
//         }
    
//         const coodirnates = transformCoordinatesToPixels(locations.length == 0 ? maxLocations : locations, container);
    
//         heatmapInstance.setData({
//             min: 0,
//             max: 100,
//             data: coodirnates,
//         });
//   };
// };

// const createElement = (el, container) => {
//     const element = document.createElement("option");
//     element.setAttribute("value", el.id);
//     element.textContent = el.name;

//     container.appendChild(element);
// };

// const createElements = (elements, container) => {

//   while (container.childNodes.length) {
//       container.removeChild(container.lastChild);
//   }

// //   console.log(elements)

//   if (elements && elements.length === 0) {
//       createElement({ id: "NO_EXISTS", name: "Sin ciudades" }, container);
//   } else if (elements) {
//       createElement({ id: "NO_EXISTS", name: "Seleccionar municipio." }, container);
//       elements.forEach(el => createElement(el, container));
//   } else {
//       createElement({ id: "NO_EXISTS", name: "Seleccionar municipio." }, container);
//   }
// };

// const removeSelected = (nodes, id) => {
//     [...nodes].map((el) => {
//         if (el.getAttribute("value") === id) {
//             el.setAttribute("selected", "");
//         } else {
//             el.removeAttribute("selected");
//         }
//     });
// }

// function createHeatmap(data, { container, stateInput, townInput, heatmap: initialConfigurationsHeatmap }) {
//   const locations = createLocationsOnMap(data);

//   const statesId = Object.entries(simplemaps_countrymap_mapdata.state_specific)
//                     .map(([key, { name }]) => ({ id: key, name }));

//   const towsAvailable = (() => {
//     const towns = {};
    
//     statesId.forEach(({ name, id }) => {
//         towns[id] = data
//                     .filter((el) => el.admin_name == name)
//                     .map(({ city: name }) => ({ id: name, name }));
//     });
//     return towns;
//   })();

//     //   const InitialConfigurationsHeatmap = {
//     //       container,
//     //       radius: 10,
//     //       maxOpacity: 0.5,
//     //       minOpacity: 0,
//     //       blur: 0.75,

//     //       ...initialConfigurationsHeatmap,
//     //   };

//     // Render first locations
//   createElements(statesId, stateInput);

//   /**
//    * This function is called after the map has finished loading.
//    */
//   simplemaps_countrymap.load()
//   simplemaps_countrymap.hooks.complete = () => {
//     // create heatmap with configuration  
//     // let heatmapInstance = h337.create(InitialConfigurationsHeatmap);
//     // let setData = storeData(heatmapInstance, container, locations);

//     // setData(locations);

//     // simplemaps_countrymap.hooks.zooming_complete = () => setData(locations);
//     // simplemaps_countrymap.hooks.zoomable_click_state = (id) => {
//     //     createElements(towsAvailable[id], townInput);
//     //     removeSelected(stateInput.childNodes, id);
//     // };
   
//     // State change event
//     // stateInput.addEventListener("change", () => {    
//     //     createElements(towsAvailable[stateInput.value], townInput);
//     //     removeSelected(stateInput.childNodes, stateInput.value);
//     //     if(stateInput.value != "NO_EXISTS") {
//     //         simplemaps_countrymap.state_zoom(stateInput.value);
//     //     } else {
//     //         simplemaps_countrymap.back();
//     //     }
//     // });

//     // Town change event
//     // townInput.addEventListener("change", () => {
//     //     setData(locations.filter((el) => el.city == townInput.value)); 
//     // });
//   };
// }



// // copy(data.map(el => {
// //     return {
// //         ...el,
// //         value: (() => {
// //             function getRandomInt(min, max) {
// //                 return Math.floor(Math.random() * (max - min)) + min;
// //             }

// //             switch (getRandomInt(1, 5)) {
// //                 case 1:
// //                     return "certificate";
// //                 case 2:
// //                     return "denied";
// //                 case 3:
// //                     return "in_progress";
// //                 default:
// //                     return "uncertified";
// //             }
// //         })(),
// //         name: "Test",
// //         description: "test description"
// //     }
// // }))