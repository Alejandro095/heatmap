const STATESIDs = {
    1: "Aguascalientes",
    2: "Baja California",
    3: "Baja California Sur",
    4: "Campeche",
    5: "Chiapas",
    6: "Chihuahua",
    7: "Distrito Federal",
    8: "Coahuila",
    9: "Colima",
    10: "Durango",
    11: "Guanajuato",
    12: "Guerrero",
    13: "Hidalgo",
    14: "Jalisco",
    15: "México",
    16: "Michoacán",
    17: "Morelos",
    18: "Nayarit",
    19: "Nuevo León",
    20: "Oaxaca",
    21: "Puebla",
    22: "Querétaro",
    23: "Quintana Roo",
    24: "San Luis Potosí",
    25: "Sinaloa",
    26: "Sonora",
    27: "Tabasco",
    28: "Tamaulipas",
    29: "Tlaxcala",
    30: "Veracruz",
    31: "Yucatán",
    32: "Zacatecas"
}

const ColoresCertificacionID = {
    1: {
        name: "uncertified",
        color: "#000"
    },
    2: {
        name: "in_progress",
        color: "#FC541F"
    },
    3: {
        name: "denied",
        color: "#F83527"
    },
    4: {
        name: "certificate",
        color: "#4DBF3B"
    }
}

const createLocationsOnMap = (locations) => {
    const locationsObject = {};
    /**
     * The following function converts the information (array) into an object 
     * that is then passed to simplemaps
     */
    locations.forEach((location) => {
        const key = `map_point point_${Math.random()}`;
        locationsObject[key] = {
            ...location,
            state: STATESIDs[location.entidadID],
            name: location.PenitenciarioCEDesc,
            status: ColoresCertificacionID[location.certificacionID].name,
            lat: location.latitud || location.lat,
            lng: location.longitud || location.lng,
            /**
             * The description property carries the 
             * html structure of the pop-up
             */
            description: `
                <div class="pop-up">
                    <div class="section">
                        <div class="title"> CENTRO PENINTENCIARO </div>
                        <div class="content">
                            <div class="icon"> <img src="./assets/icon-1.jpeg" /> </div>
                            <div class="info"> ${location.PenitenciarioCEDesc} </div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="title"> RESULTADO GLOBAL </div>
                        <div class="content">
                            <div class="icon"> <img src="./assets/icon-2.jpeg" /> </div>
                            <div class="info color-status-${location.certificacionID} ${location.certificacionID === 4 ? 'flex-container' : "" }">
                                <div> 
                                    <svg class="svg-icon">
                                        <image xlink:href<image xlink:href="./assets/icon-${location.certificacionID}.svg" src="="./assets/check.svg" width="90" height="90"/> .svg" src="yourfallback.png"/> 
                                    </svg> 
                                    ${location.certificacionID === 4 ? "<div>"+ location.certificacionDesc +"</div>" : ""}
                                </div>
                                <div>${ location.certificacionID === 4 
                                        ?  "<div class='progress'>" + (location.porc * 100 || 0 ).toFixed(2) + "%</div>"
                                        : location.certificacionDesc || "Sin dato"}</div>
                            </div>    
                        </div>
                    </div>
                </div>
            `,
            key,
            opacity: 1,
            border_color: "#f3f2f0",
            border: 1.5,
            type: "circle",
            color: ColoresCertificacionID[location.certificacionID].color
        };
    });
    simplemaps_countrymap_mapdata.locations = locationsObject;
}

const mapInitialData = (data, statesIds) => {
    let objectNewData = {};

    /**
     * The function converts the data into an array and 
     * adds its penitentiaries to it.
     */
    Object.entries(statesIds).map(([key, { name }]) => {
        objectNewData[key] = {
            name,
            penitentiaries: Object.values(data).filter((town) => town.state === name)
        }
    })
    
    /**
     * The function hides the locations with the simeplemaps API 
     * and refreshes the map
     */
    const hideElements = (search, showFunction) => {
        if(search) {
            Object.entries(data).forEach(([_, el]) => el.hide = "yes");
            showFunction();
        } else {
            Object.entries(data).forEach(([_, el]) => el.hide = "no");
        }
        simplemaps_countrymap.refresh();
    }
    
    return  {
        /**
         * The exposed function hides all the locations 
         * with the established parameter.
         */
        hideElements: (status) => {
            Object.entries(data).forEach(([_, el]) => {
                el.hide = "yes";

                if(el.status == status || status == "all") {
                    el.hide = "no";
                }
            });
            simplemaps_countrymap.refresh();
        },

        /**
         * The exposed function filters all the locations 
         * with the established parameters.
         */
        filter: (state = undefined, penitentiary = undefined) => {
            try {

                // Filter by state and prison
                if(state && penitentiary) {
                    const search = objectNewData[state].penitentiaries.filter(({ name }) => name === penitentiary )[0];
                    hideElements(search, () => data[search.key].hide = "no")

                    return search;    
                } else if (state) {
                    // Filter by state
                    const search = objectNewData[state]
                    hideElements(search, () => {
                        search.penitentiaries.forEach(({key}) => {
                            data[key].hide = "no"
                        })
                    })
    
                    return objectNewData[state].penitentiaries || [];
                } else {
                    /**
                     * In case the state and prison parameters are undefined, 
                     * all the locations will be shown and the initial 
                     * information will be returned.
                     */
                    Object.entries(data).map(([_, el]) => el.hide = "no");
                    simplemaps_countrymap.refresh();
    
                    return Object.entries(objectNewData).map(([key, {name}]) =>{
                        return {
                            key, name
                        }
                    });
                }   
            } catch (error) {
                /**
                 * If the value does not exist or there is an error, 
                 * the initial data will be returned and all the 
                 * locations will be displayed.
                 */
                simplemaps_countrymap.back()
            }
        }
    }

};

const createOptionElement = ({key, name}) => {
    const option = document.createElement("option");
    // Check which key to use depending on the length of the string
    option.setAttribute("value", key && key.length == 7 ? key : name);
    option.textContent = name;

    return option;
}

const insertOptionsElements = (optionsData = [], target, type = "estado") => {

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

const createChart = (data) => {
    /**
     * This function converts the array of prisons into an array 
     * with the number of prisons filtered by the status property
     */
    const mapData = (penitentiariesData) => {
        const placeHolder = {
            certificate: 0,
            denied: 0,
            in_progress: 0,
            uncertified: 0
        };
        penitentiariesData.forEach((el) => placeHolder[el.status]++ );
        return Object.values(placeHolder);
    }
    
    // Map initial data
    const initialData = mapData(data);
    const htmlTitle = document.querySelector(".chart-title");

    // Create Doughnut and Pie chart with Chart.js
    const chart =  new Chart(document.getElementById("doughnut-chart"), {
        type: 'doughnut',
        data: {
          labels: ["Certificado", "Denegado", "En proceso", "Sin certificar"],
          datasets: [{
              backgroundColor: ["#4DBF3B", "#F83527","#FC541F","#000"],
              data: initialData,
            }]
        },
        options: {
          title: false,
          legend: false,
        }
    });

    return {
        /**
         * The following function updates the graph 
         * and renames the span (the title).
         */
        update: (data = undefined, title) => {
            htmlTitle.innerText = title;
            chart.data.datasets[0].data = typeof data === "undefined" ? initialData : mapData(data);
            chart.update();
        }
    }
}

function createMap(data, { stateInput, penitentiariesInput, filterInput }) {
    // Create locations on map
    createLocationsOnMap(data);
    simplemaps_countrymap.load()
    simplemaps_countrymap.hooks.complete = () => {
        // Mapdata simplemaps locations and return functions to filter.
        const { filter, hideElements} =  mapInitialData(simplemaps_countrymap_mapdata.locations, simplemaps_countrymap_mapdata.state_specific);
        // Create chart
        const { update } = createChart(Object.values(simplemaps_countrymap_mapdata.locations));
        // Get initial data without filters
        const initialStates = filter();

        // Insert options elements of states
        insertOptionsElements(initialStates, stateInput);

        const handlerStateInput = () => {
            const penitentiaries = filter(stateInput.value);
            
            // Insert options elements of penitentiaries 
            insertOptionsElements(penitentiaries, penitentiariesInput, "penitenciaria");
            simplemaps_countrymap.state_zoom(stateInput.value);
            // Update chart
            update(penitentiaries, simplemaps_countrymap_mapdata.state_specific[stateInput.value].name)
        }

        const handlerPenitentiariesInput = () => {
            filter(stateInput.value, penitentiariesInput.value);
        }

        const handlerFilterInput = () => {
            hideElements(filterInput.value)
        }

        simplemaps_countrymap.hooks.back = () => {
            // Filter all prisons and refresh
            filter()
            // Insert options elements of states
            insertOptionsElements(initialStates, stateInput);
            // Insert options elements of penitentiaries
            insertOptionsElements([], penitentiariesInput, "penitenciaria");
            // Update chart with initialStates has default data
            update(undefined, "Nacional")
        };
        simplemaps_countrymap.hooks.zoomable_click_state = (id) => {
            // Add the selected attribute to the chosen option and remove the previous ones
            removeSelected(stateInput.childNodes, id);
            handlerStateInput();
        } ; 	

        // Events
        stateInput.addEventListener("change", handlerStateInput);
        penitentiariesInput.addEventListener("change", handlerPenitentiariesInput);
        filterInput.addEventListener("change", handlerFilterInput)
    };
}