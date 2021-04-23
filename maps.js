// Author: Ryan Jay Salapare - 000823653
function loadMapScenario() {
    $(document).ready(function () {
        let lat
        let long

        function success(pos) {
            lat = pos.coords.latitude
            long = pos.coords.longitude
        }

        let id = navigator.geolocation.getCurrentPosition(success, errorCallback)

        function errorCallback(error) {
            let errorMessage
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'User denied the request for geolocation'
                    document.getElementById("error").style.color = "red";
                    break
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable'
                    document.getElementById("error").style.color = "red";
                    break
                case error.TIMEOUT:
                    errorMessage = 'The request to get user location timed out'
                    document.getElementById("error").style.color = "red";
                    break
                case error.UNKNOWN_ERROR:
                default:
                    errorMessage = 'An unknown error occurred'
                    document.getElementById("error").style.color = "red";
                    break
            }
            $('#error').html(`Error: ${errorMessage}`)
        }

        let map
        let infoboxOptions
        let infobox
        let location
        let pushpinOptions
        let pushpin

        //CREATE THE MAP WITH ALL THE PUSHPINS INCLUDED WHEN USER STARTS CLICKING ONE OF THE BUTTONS ON THE LEFT
        //DEPENDING WHAT FILTER THEY WOULD LIKE
        function createMap() {
            map = new Microsoft.Maps.Map(document.getElementById('map'), {
                center: new Microsoft.Maps.Location(43.2557, -79.871),
            })

            // PUSHPIN SECTION
            infoboxOptions = {
                visible: false,
            }
            infobox = new Microsoft.Maps.Infobox(map.getCenter(), infoboxOptions)

            infobox.setMap(map)

            for (i = 0; i < education.length; i++) {
                location = new Microsoft.Maps.Location(
                    education[i].LATITUDE,
                    education[i].LONGITUDE
                )

                pushpinOptions = {
                    title: education[i].NAME,
                }

                pushpin = new Microsoft.Maps.Pushpin(location, pushpinOptions)
                pushpin.metadata = {
                    myTitle: education[i].NAME,
                    myAddress: education[i].ADDRESS,
                    myCategory: education[i].CATEGORY,
                    myCommunity: education[i].COMMUNITY
                }

                Microsoft.Maps.Events.addHandler(pushpin, 'click', pushpinClicked)
                map.entities.push(pushpin)
            }


            function pushpinClicked(e) {
                // Show in the map the direction Point A to Point B. This is to counter
                // the idea that we hide the element with the id of 'directions' whenever we 
                // hit the Clear Directions button
                document.getElementById("directions").style.visibility = "visible";

                // Show the metadata of a pushpin when clicked
                if (e.target.metadata) {
                    infobox.setOptions({
                        location: e.target.getLocation(),
                        title: e.target.metadata.myTitle,
                        description: e.target.metadata.myAddress + "<br>" +
                            e.target.metadata.myCategory + "<br>" +
                            e.target.metadata.myCommunity,
                        visible: true
                    })
                }

                // DIRECTIONS SECTION
                let firstWaypoint; //Point A
                // let secondWaypoint; //Point B
                let secondWaypoint;

                let mapDirections = new Microsoft.Maps.Map('#directions')

                Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {

                    let directionsManager = new Microsoft.Maps.Directions.DirectionsManager(mapDirections)

                    firstWaypoint = new Microsoft.Maps.Directions.Waypoint({
                        address: 'Hamilton, Ontario',
                    })

                    directionsManager.addWaypoint(firstWaypoint)

                    secondWaypoint = new Microsoft.Maps.Directions.Waypoint({
                        address: e.target.metadata.myAddress + ", " +
                            e.target.metadata.myCommunity,
                    })

                    directionsManager.addWaypoint(secondWaypoint)

                    directionsManager.setRenderOptions({
                        itineraryContainer: '#directionsDescription',
                    })

                    directionsManager.calculateDirections()
                })
            }
        }

        // FUNCTION TO DETERMINE WHAT KIND OF EDUCATIONAL INSTITUTION IT IS
        function educationInstitution(type) {
            for (var i = map.entities.getLength() - 1; i >= 0; i--) {
                if (education[i].CATEGORY !== type)
                    map.entities.removeAt(i);
            }
        }

        //Buttons Section
        let allButton = document.getElementById("all");
        let elemButton = document.getElementById("elem");
        let midButton = document.getElementById("middle");
        let secondButton = document.getElementById("second");
        let postButton = document.getElementById("post");
        let altButton = document.getElementById("alt");
        let adultButton = document.getElementById("adult");
        let sec23Button = document.getElementById("sec23");
        let clearButton = document.getElementById("clearButton");
        let formButton = document.getElementById("addPushpin");

        //Functions after buttons are clicked

        formButton.onclick = function formPushpin() {
            let formAddress = document.getElementById("address").value;
            Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
                searchManager = new Microsoft.Maps.Search.SearchManager(map)
                geocodeQuery(formAddress)
            })

            function geocodeQuery(query) {
                var searchRequest = {
                    where: query,
                    callback: function (r) {
                        // Add the first result to the map and zoom into it
                        if (r && r.results && r.results.length > 0) {
                            // add a pushpin to the map at the location supplied in the results
                            var pin = new Microsoft.Maps.Pushpin(r.results[0].location)
                            map.entities.push(pin)

                            pinInfobox = new Microsoft.Maps.Infobox(map.getCenter(), {
                                visible: false
                            })

                            pinInfobox.setMap(map);

                            let formName = document.getElementById("name").value;
                            pin.metadata = {
                                title: (`${formName}`),
                                description: (`${formAddress}`)
                            }

                            Microsoft.Maps.Events.addHandler(pin, 'click', pinClicked);

                            function pinClicked(e) {
                                if (e.target.metadata) {
                                    pinInfobox.setOptions({
                                        location: e.target.getLocation(),
                                        title: e.target.metadata.title,
                                        description: e.target.metadata.description,
                                        visible: true
                                    })
                                }
                            }

                        } else {
                            alert('Error')
                        }
                    },
                    errorCallback: function (e) {
                        // If there is an error, alert the user about it
                        alert('No results found')
                    },
                }
                // Make the geocode request
                searchManager.geocode(searchRequest)
            }
        }

        //Hide the Direction portion of the webpage when clearButton is clicked
        clearButton.onclick = function () {
            document.getElementById("directions").style.visibility = "hidden";
        }

        allButton.onclick = function () {
            createMap();
        }

        elemButton.onclick = function () {
            createMap();
            educationInstitution("Elementary School")
        }

        midButton.onclick = function () {
            createMap();
            educationInstitution("Middle School")
        }

        secondButton.onclick = function () {
            createMap();
            educationInstitution("Secondary School")
        }

        postButton.onclick = function () {
            createMap();
            educationInstitution("Post Secondary")
        }

        altButton.onclick = function () {
            createMap();
            educationInstitution("Alternative Education")
        }

        adultButton.onclick = function () {
            createMap();
            educationInstitution("Adult Learning")
        }

        sec23Button.onclick = function () {
            createMap();
            educationInstitution("Section 23 Program")
        }
    })

}