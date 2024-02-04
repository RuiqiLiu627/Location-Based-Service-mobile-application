import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  Modal,
  Marker,
  position,
  Circle,
  LocalTile,
  UrlTile,
  WMSTile,
  TextInput
} from 'react-native';
import MapView,{Geojson} from 'react-native-maps';
import MapUrlTile from 'react-native-maps';
import MapWMSTile from 'react-native-maps';
import MapCircle from 'react-native-maps';
import MapPolyline from 'react-native-maps';
import axios from 'axios';

import {Route, Link, NativeRouter as Router} from 'react-router-native';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';



acc=250;
lon=0;
lat=0;
rad=250;

export default class testCoords extends React.Component {
    state = {
    mapRegion: null,
    lastLat: 0,
    lastLong: 0,
    accuracy:0,
    speed:null,
    counter:250,
    text:0,
    routeCoordinates: [],
    markerList: [],
    position:[0,0],
    data:{"type":"FeatureCollection",
               "features":[
               {"type":"Feature",
                "id":"waypoints.1",
                "geometry":{
                "type":"Point",
                "coordinates":[8.422148,49.019233]},
                "geometry_name":"geom",
                "properties":{"groupname":"Android Group"}
                },
                {"type":"Feature",
                 "id":"waypoints.2",
                 "geometry":{
                 "type":"Point",
                 "coordinates":[8.422148,49.019233]},
                 "geometry_name":"geom",
                 "properties":{"groupname":"Android Group"}}],
                 "totalFeatures":31,
                 "numberMatched":31,
                 "numberReturned":2,
                 "timeStamp":"2022-07-02T12:20:50.770Z",
                 "crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::4326"}}
                 }
         }







    colorMath() {
          return '#'+Math.floor(Math.random()*16777215).toString(16);
      }
    componentDidMount() {
        let accuracy=0
        let speed=0
        let counter=0
        let region={};

        watchID = Geolocation.watchPosition((position) => {
        console.log(position, 'position')

        markerss=[]
        // Create the object to update this.state.mapRegion through the onRegionChange function
        region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08
        }
        const { routeCoordinates } = this.state
        const { markerList } = this.state
        const positionLatLngs =[{latitude:position.coords.latitude,longitude: position.coords.longitude}]

        accuracy = position.coords.accuracy
        speed = position.coords.speed
        counter = 250
        markers =[{pinColor: this.colorMath,coordinates:{latitude:position.coords.latitude,longitude: position.coords.longitude}}]
        console.log(markers,'markers')
        markerss.push(markers)
        console.log(markerss,'list')

        this.setState({
        accuracy: accuracy,
        speed: speed,
        lastLat: position.coords.latitude,
        lastLong: position.coords.longitude,
        position:position,
        mapRegion: region,
        counter: counter,
        routeCoordinates: routeCoordinates.concat(positionLatLngs),
        markerList: markerss
        })

        // insert points
        timer=setInterval(()=>{
        var data = '<wfs:Transaction service="WFS" version="1.0.0"\r\nxmlns:MobileGIS="http://193.196.36.78"\r\nxmlns:ogc="http://www.opengis.net/ogc"\r\nxmlns:wfs="http://www.opengis.net/wfs">\r\n  <wfs:Insert>\r\n    <waypoints>\r\n     <groupname>\r\n       React Group\r\n     </groupname>\r\n      <geom>\r\n        <ogc:Point srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">\r\n          <ogc:coordinates>\r\n'+position.coords.longitude+','+position.coords.latitude+'\r\n          </ogc:coordinates>\r\n        </ogc:Point>\r\n      </geom>\r\n    </waypoints>\r\n  </wfs:Insert>\r\n</wfs:Transaction>';
        var config = {
        method: 'post',
        url: 'http://193.196.36.78:8080/geoserver/MobileGIS/ows?SERVICE=WFS&VERSION=1.0.0&REQUEST=Transaction',
        headers: {
        'Content-Type': 'text/plain'
        },
        data : data
        };
        axios(config)
        .then(function (response) {
        console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
        console.log(error);
        });
        console.log(markerss,'markerlistttt')

        },60*1000)
        },(err)=> {
        console.warn('ERROR(' + err.code + '): ' + err.message);
        },{
        enableHighAccuracy: true,
        timeout: 3*1000,
        maximumAge: 0
        });
    }


    //This function shows GPS information
    onPressButton() {
        alert('longitude     '+this.state.lastLong+
        '\n'+'latitude     '+this.state.lastLat+
        '\n'+'accuracy     '+this.state.accuracy+
        '\n'+'speed     '+this.state.speed)
        console.log(this.state.lastLat,'spp')

    }

    //This function can change buffer radius
    addition() {
        var double = parseFloat(this.state.text)
        this.state.counter= double;
        lat=this.state.lastLat;
        lon=this.state.lastLong;
        acc=this.state.accuracy;
        rad = this.state.counter;
        alert(rad);
        this.forceUpdate();
    }

    //WFS
    startFetch(){
    BackgroundTimer.runBackgroundTimer(() => {
    const GEOSERVER = 'http://193.196.36.78:8080/geoserver/MobileGIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobileGIS:waypoints&outputFormat=json&cql_filter=%22groupname%22=%27React%20Group%27';

    const REQUEST_PARAMS = {
       SERVICE: 'WFS',
             VERSION: '1.1.0',
             REQUEST: 'GetFeature',
             TYPENAME: 'MobileGIS:waypoints',

    };

     axios.get(GEOSERVER, { params: REQUEST_PARAMS })
                .then(( data ) => {
                console.log(data.data,'data')
                this.state.data=data.data
                 console.log(this.state.data,'statettt')
                })
                .catch(error => Promise.reject(error));

     this.forceUpdate();
     },3000)
          }


    StopTimer(){
    clearInterval(timer)
    }

    Clear(){
    var datadelete = '<wfs:Transaction service="WFS" version="1.0.0"\r\nxmlns:MobileGIS="http://193.196.36.78"\r\nxmlns:ogc="http://www.opengis.net/ogc"\r\nxmlns:wfs="http://www.opengis.net/wfs">\r\n   <Delete xmlns:xcy="http://geoserver.org/nyc" typeName="MobileGIS:waypoints">\r\n<ogc:Filter>   \r\n      <ogc:PropertyIsEqualTo>\r\n      <ogc:PropertyName>groupname</ogc:PropertyName>\r\n      <ogc:Literal>React Group</ogc:Literal>\r\n      </ogc:PropertyIsEqualTo>\r\n     </ogc:Filter>   \r\n  </Delete>\r\n</wfs:Transaction>';

    var config = {
      method: 'post',
      url: 'http://193.196.36.78:8080/geoserver/MobileGIS/ows?SERVICE=WFS&VERSION=1.0.0&REQUEST=Transaction',
      headers: {
        'Content-Type': 'text/plain'
      },
      data : datadelete
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

    this.state.routeCoordinates=[];
    this.forceUpdate();
    }


    render() {
        return (
        <View style={{flex: 1}}>
        <View>
        </View>
        <MapView
            key={this.state.forceRefresh}
            style={styles.map}
            zoomEnabled={true}
            scrollEnabled={true}
            region={this.state.mapRegion}
            showsUserLocation={true}
            followUserLocation={true}
        >
        <Geojson geojson={this.state.data} />
            <MapView.Polyline
                coordinates = {this.state.routeCoordinates}
                strokeColor = '#19B5FE'
                strokeWidth = {5}
            />
            <MapView.UrlTile
                urlTemplate="https://a.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
                shouldReplaceMapContent={true}
            />
          <MapView.Circle
                center = {{latitude: lat, longitude:lon}}
                radius={rad}
            />
          <MapView.Circle
                center = {{latitude: lat, longitude: lon}}
                radius={acc}
                strokeColor="red"
            />
        </MapView>
        <View>
            <Button   onPress={this.onPressButton.bind(this)}   title="Get the location information">
            </Button>
            <Button   onPress={this.addition.bind(this)}   title="Change buffer radius">
            </Button>
            <Button   onPress={this.startFetch.bind(this)}   title="Show WFS">
                        </Button>
            <Button   onPress={this.StopTimer.bind(this)}   title="Stop Timer">
                                    </Button>
            <Button   onPress={this.Clear.bind(this)}   title="Clear">
                                                </Button>
            <TextInput
                 placeholder="New Buffer Radius in meter"
                 type='double'
                 id="myInput"
                 onChangeText={(text) => this.setState({text})}
                 value={this.state.text}
            />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
    button: {
      alignItems: "center",
      backgroundColor: "#DDDDDD",
      padding: 10
    }
});