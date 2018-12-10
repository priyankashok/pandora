import React, { Component } from 'react';
//import {Navbar, Nav, NavDropdown,NavItem, MenuItem} from 'react-bootstrap';
import './App.scss';
import ArtistMetrics from './ArtistMetrics.js'
import { Button, ControlLabel, FormControl } from 'react-bootstrap';
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      artists: [],
      artistInput: '',
      limit: 10,
      totalArtists: '',
      selectedArtist: null,
      open: true
    };

  }

  componentDidMount(){
    this.fetchArtists();
  }

  increaseLimit = ()=>{
    let increasedLimit = this.state.limit+10;
    this.setState({
      limit: increasedLimit
    },this.fetchArtists);
  }

  fetchArtists= () =>{
    
    let artistValue = this.state.artistInput;
    let defaultArtist = false;
    if(!artistValue){
      artistValue = 'Ed Sheeran';
      defaultArtist = true;
    }

    let artistAPI = `https://api.nextbigsound.com/search/v1/artists/?query=${artistValue}&limit=${this.state.limit}&access_token=eb74a82009cbc53c9b44866743633f9d`;
      fetch(artistAPI)
        .then(res => res.json())
        .then(
          (result) => {
          
            if(defaultArtist){
             let defaultVal = '';
              result.artists.map((item,index)=>{
              //  console.log("result: "+JSON.stringify(item,null,2));
                defaultVal = item;
              })
         
              this.displayArtistInfo(defaultVal);
            }else{
              this.setState({
                  isLoaded: true,
                  totalArtists: result.total_artists,
                  artists: result.artists
                });
            }
          },
          (error) => {
            console.log("error: "+error);
            this.setState({
              isLoaded: true,
              error
            })
          }
        )
  }
 
  handleInput = (event) =>{
    let value = event.target.value;
      this.setState({
        artistInput: value,
        limit: 10  //resetting limit to 10
      },this.fetchArtists);
  }

  displayArtistInfo =(artist)=>{
      this.setState({
        selectedArtist: artist,
        isLoaded: true
      })
  }

  abbreviate=(number, maxPlaces)=> {
    number = Number(number);
    var abbr;
    if(number >= 1e12) {
      abbr = 'T';
    }
    else if(number >= 1e9) {
      abbr = 'B';
    }
    else if(number >= 1e6) {
      abbr = 'M';
    }
    else if(number >= 1e3) {
      abbr = 'K';
    }
    else {
      abbr = '';
    }
    return this.annotate(number, maxPlaces, abbr);
  }
  
  annotate = (number, maxPlaces, abbr)=> {
    // set places to false to not round
    var rounded = 0;
    switch(abbr) {
      case 'T':
        rounded = number / 1e12;
        break;
      case 'B':
        rounded = number / 1e9;
        break;
      case 'M':
        rounded = number / 1e6;
        break;
      case 'K':
        rounded = number / 1e3;
        break;
      case '':
        rounded = number;
        break;
    }
    if(maxPlaces !== false) {
      var test = new RegExp('\\.\\d{' + (maxPlaces + 1) + ',}$');
      if(test.test(('' + rounded))) {
        rounded = rounded.toFixed(maxPlaces);
      }
    }
    return rounded + abbr;
  }
  
  toggleCollapse=()=>{
    this.setState({
      open: !this.state.open
    });
  }

  render() {
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    }
     
    let artist = this.state.selectedArtist;
    let artistList='';
    let responseMessage = '';

    if(this.state.artists){
    //  let imgSize = '40';
      artistList = this.state.artists.map((artist, index) =>{
        let img = artist.images[0].original;
        return <div key={index} className="artistList" onClick={this.displayArtistInfo.bind(this, artist)}><div><img src={img} alt=""/></div><div className="name">{ artist.name }</div></div>;
      });
    }
    
    if(this.state.totalArtists > 0 && this.state.totalArtists < this.state.limit){
      responseMessage = (<div className="warning">That's all we've got!</div>);
    }else if (this.state.totalArtists === 0 && this.state.limit > 0){
      responseMessage = (<div className="warning">Sorry, try another artist</div>);
    }else if(this.state.totalArtists === this.state.limit){
      responseMessage = (<Button bsSize="small" onClick={this.increaseLimit}>show more</Button>);
    }

    let streams = '';
    let collapseText = this.state.open ? '-' : '+';

    if(artist){
      streams = this.abbreviate(artist.totals.streams,2); 
    }
    
    return (
      <div className="App">
        <div className="App-header">
          Artist Social Demographics
        </div>
        
        <div className="container">
        {artist ?
          <div className="artistInfo">
            <img src={artist.images[0].original} alt=""/>
            <div className="info">
              <div className="name">{artist.name}</div>
              <div className="cat">{artist.category? <span>{artist.category.name}</span>:''}</div>
              <div className="streams">
                <div className="title">Streams</div>
                <div className="result">{streams}</div></div>
              </div>
              <ArtistMetrics
                artistId={artist.id}
              />
          </div>:''}
        
          <div className="section-searchArtist">
            <ControlLabel>Search by Artist Name</ControlLabel>
            <FormControl
              type="text"
              value={this.state.artistInput}
              placeholder="Enter Artist Name"
              onChange={this.handleInput}
            />
            { this.state.artistInput && this.state.artistInput.length> 0?<div>
              <Button bsSize="small" className="btnCollapse" onClick={this.toggleCollapse.bind(this)}>
                {collapseText}
              </Button>
              <div className={"collapse" + (this.state.open ? ' in' : '')}>
                {artistList}
                {responseMessage}
              </div>
              
              </div>:''}
          </div>
        </div>
      </div>
    );
  }
}
export default App;
