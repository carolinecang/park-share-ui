import React from 'react';
import mapConfig from './mapconfig.js';
import { Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import Filters from './Filters.jsx';
import MarkerInfo from './MarkerInfo.jsx';
import Listings from './MapListings.jsx';
import axios from 'axios';

class MainMapContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spots: [
                {
                    address: '17933 Castellammare Dr, Pacific Palisades, CA 90272',
                    longitude: -118.565495,
                    latitude: 34.042962,
                    name: `Taylor's house`
                },
                {
                    address: '1900 Glendon Ave, Los Angeles, CA 90025',
                    longitude: -118.434037,
                    latitude: 34.048813,
                    name: `Taylor's apartment`
                },
                {
                    address: '6060 Center Dr, Los  Angeles,  CA 90045',
                    longitude: -118.391106,
                    latitude: 33.976126,
                    name: 'Hack Reactor @ Galvanize'
                },
                {
                    address:  '811 W 7th St, Los  Angeles,  CA 90017',
                    longitude:  -118.258964,
                    latitude: 34.049140,
                    name: 'WeWork Fine Arts'
                }
            ],
            filteredSpots: [],
            showingInfo: false,
            activeMarker: {},
            selectedPlace: {},
            zip: '',
            filteredZips: [],
            filteredDates: undefined,
            filteredTimes: undefined,
            allFilters: [],
            // currViewyZip: {},
            points: [],
            bounds: null
        }
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.onMapClick = this.onMapClick.bind(this);
        this.handleZipFilter = this.handleZipFilter.bind(this);
        this.handleFilterSubmit = this.handleFilterSubmit.bind(this);
        this.filterByZip = this.filterByZip.bind(this);
        this.removeFilter = this.removeFilter.bind(this);
        // this.convertZipToLatLong = this.convertZipToLatLong.bind(this);
        this.adjustBounds = this.adjustBounds.bind(this);
    }

    componentDidMount() {
        // let allZips = [];
        let {spots} = this.state;
        // for (let spot of spots) {
        //     allZips.push({lat: spot.latitude, lng: spot.longitude})
        // }
        this.setState({ 
            filteredSpots: spots
            // points: allZips
         }, () => {
             this.adjustBounds(this.state.filteredSpots);
         })
    }

    onMarkerClick(props, marker, e) {
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfo: true
        })
    }

    onMapClick() {
        if (this.state.showingInfo) {
            this.setState({
                showingInfo: false,
                activeMarker: null
            })
        }
    }

    handleZipFilter(e) {
        this.setState({ zip: e.target.value })
    }

    filterByZip(zips) {
        let { spots } = this.state;
        let newFilteredZips = [];
        for (let zip of zips) {
            for (let spot of spots) {
                if (spot.address.includes(zip)) {
                    newFilteredZips.push(spot)
                }
            }
        }
        this.setState({filteredSpots: newFilteredZips}, () => {
            this.adjustBounds(this.state.filteredSpots)
        });
    }

    // convertZipToLatLong(spots) {
    //     let geocoder = new google.maps.Geocoder();
    //     let points = [];
    //     for (let spot of spots) {
    //         geocoder.geocode({ 'address': `${zip}, US` }, (result, status) => {
    //             if (status === google.maps.GeocoderStatus.OK) {
    //                 let lat = result[0].geometry.location.lat();
    //                 let lng = result[0].geometry.location.lng(); 
    //                 points.push({lat, lng});
    //             } else {
    //                 console.log('zip conversion failed')
    //             }
    //         })
    //     }
    //     console.log('points in conversion', points)
    //     this.setState({points}, () => this.adjustBounds())
    // }

    adjustBounds(spots) {
        let bounds = new google.maps.LatLngBounds();
        let allZips = [];
        for (let spot of spots) {
            allZips.push({lat: spot.latitude, lng: spot.longitude})
        }
        for (let point of allZips) {
            bounds.extend(point);
        }
        this.setState({bounds});
    }

    handleFilterSubmit(e) {
        e.preventDefault();
        let { allFilters, zip, filteredZips } = this.state;
        if (!filteredZips.includes(zip)) {
            let allFilteredZips = filteredZips.concat(zip);
            let filters = allFilters.concat(zip);
            this.setState({
                allFilters: filters,
                filteredZips: allFilteredZips
            });
            this.filterByZip(allFilteredZips);
        }
        
        document.getElementById('filterForm').reset(); 
    }

    removeFilter(e) {
        e.preventDefault();
        let currZip = e.target.id;
        let {filteredZips} =  this.state;
        let newZips = [];
        for (let zip of filteredZips) {
            if (zip !== currZip) {
                newZips.push(zip)
            }
        }
        if (newZips.length > 0) {
            this.setState({filteredZips: newZips, allFilters: newZips})
            this.filterByZip(newZips);
        } else {
            this.setState({
                filteredZips: [], 
                allFilters: [],
                filteredSpots: this.state.spots
            }, () => this.adjustBounds(this.state.filteredSpots))
        }   
    }

    render() {
        const mapStyle = {
            width: '90%',
            height: '90%'
        }
        const { filteredSpots, allFilters, bounds } = this.state;

        return (
            <div>
                <Filters handleZipFilter={this.handleZipFilter} filters={allFilters} handleFilterSubmit={this.handleFilterSubmit} removeFilter={this.removeFilter} />

                <Listings filteredSpots={filteredSpots} />

                <Map
                    google={this.props.google}
                    style={mapStyle}
                    initialCenter={{
                        lat: 34.046281,
                        lng: -118.382902
                    }}
                    // center={this.state.currViewByZip}
                    bounds={bounds}
                    // zoom={12}
                    onClick={this.onMapClick}>

                    {filteredSpots.map((spot, i) => {
                        return <Marker
                            key={i}
                            name={spot.name}
                            title={spot.address}
                            position={{ lat: spot.latitude, lng: spot.longitude }}
                            onClick={this.onMarkerClick}
                            icon={{
                                url: 'https://images.myparkingsign.com/img/lg/K/aluminum-parking-sign-k-1605.png',
                                anchor: new google.maps.Point(32, 32),
                                scaledSize: new google.maps.Size(30, 30)
                            }}
                        />
                    })}

                    <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfo} >
                        <MarkerInfo selectedPlace={this.state.selectedPlace} />
                    </InfoWindow>

                </ Map>

                
            </div>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: mapConfig.API_KEY
})(MainMapContainer);