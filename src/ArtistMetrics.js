import React, { Component } from 'react';
import './App.scss';
import { FormControl, ControlLabel, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton} from 'react-bootstrap';
//import * as d3 from "d3";
var d3 = require("d3");

class ArtistMetrics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            artistId: this.props.artistId,
            metric: 247, //TODO: make dynamic  (Twitter Mentions:247)
            startDate: '2018-12-02',
            endDate: '2018-12-08',
            chartData: null,
            dateRanges: [],
            metricText: 'Twitter Mentions',
            active: 'TM'
        };
    }
    componentWillMount(){
        this.fetchMetricData();
    }
    componentWillReceiveProps(nextProps){
        if(nextProps && nextProps.artistId !== this.props.artistId){
            this.setState({
                artistId: nextProps.artistId
            },this.fetchMetricData);
        }
    }
    parseData=(result)=> {
        this.setState({
            chartData: result,
            dateRanges: result.dateRanges,  // get dateRanges
            isLoaded: true
        });
      
        //get data
        let arr = [];
        result.data.map((item, index) =>{

            let itemArray = item.timeseries.deltas;  
            for (let key in itemArray) {
                if (itemArray.hasOwnProperty(key)) {
                    arr.push({
                        date: new Date(key), //date
                        value: +itemArray[key] //convert string to number
                    });
                }
            }
        });
        return arr;
     }
  
    drawChart=(data)=>{
        d3.selectAll("svg > *").remove();  //clearing chart before changes

        var svgWidth = 500, svgHeight = 300;
        var margin = { top: 20, right: 20, bottom: 30, left: 70 };
        var width = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;
   
        var svg = d3.select('svg')
            .attr("width", svgWidth)
            .attr("height", svgHeight);
       
        var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var x = d3.scaleTime()
            .rangeRound([0, width])

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);
        
        var line = d3.line()
            .x(function(d) { return x(d.date)})
            .y(function(d) { return y(d.value)})
            x.domain(d3.extent(data, function(d) { return d.date }));
            y.domain(d3.extent(data, function(d) { return d.value }));
        
            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                //   .attr("transform", "rotate(90)")
                .call(d3.axisBottom(x))
                //  .call(d3.axisBottom(x)
                //    .timeFormat("%m"))
                //  .select(".domain").tickFormat(d3.timeFormat("%m"))

                //   .select(".domain").tickFormat(d3.timeFormat("%Y-%b"))
                // .remove();
            
            g.append("g")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Count");
            
            g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);
   
        }
  
    fetchMetricData= () =>{
        let metricsAPI = `https://api.nextbigsound.com/artists/${this.state.artistId}/data?metricIds=${this.state.metric}&startDate=${this.state.startDate}&endDate=${this.state.endDate}&timeseries=totals,deltas&access_token=eb74a82009cbc53c9b44866743633f9d`;
            console.log("metricsAPI: "+metricsAPI)
            fetch(metricsAPI)
            .then(function(response) { return response.json(); })
            .then(this.parseData)
            .then(this.drawChart)
            .catch(function(err) { console.log(err); })
    }

    setDates=(e)=>{
      let selectedId = '';
        for (let node of e.target.children) {
            if (node.value === e.target.value) {
             selectedId = node.dataset.id;
            }
          }

        let dateRanges = this.state.dateRanges;

        for (let item in dateRanges) {
            if (dateRanges.hasOwnProperty(item)) {
                var val = dateRanges[item];
                if(val.id === selectedId){
                    this.setState({
                        startDate: val.start,
                        endDate: val.end
                    },this.fetchMetricData)
                }
            }
        }
    }

    switchMetric=(event)=>{
        let metric = event.target.attributes.refs.nodeValue;
        let metricId = '';
        let text = '';
        switch(metric){
            case 'FL':
                metricId = 11;
                text = 'Facebook Likes'
                break;
            case 'FM':
                metricId = 200;
                text = 'Facebook Mentions'
                break;
            case 'TF':
                metricId = 28
                text = 'Twitter Followers'
                break;
            case 'TM':
                metricId = 247
                text = 'Twitter Mentions'
                break;
        }
        this.setState({
            metric: metricId,
            metricText: text,
            active: metric
        },this.fetchMetricData); 
    }

    render(){
        const { error, isLoaded } = this.state;
        
        if (error) {
          return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
          return <div>Loading...</div>;
        }else{
          //  console.log("dates: "+JSON.stringify(this.state.dateRanges,null,2))
            let dateRanges = this.state.dateRanges;
            let optionItems=[];

            for (var date in dateRanges) {
                if (dateRanges.hasOwnProperty(date)) {
                var val = dateRanges[date];

                optionItems.push(
                    <option key={val.id} data-id={val.id}>{val.label}</option>
                    );
                }
            }
      
            return (
                <div className="metricsContainer">
                    <div className="btn-container">
                        <Button bsSize="small" refs="TF" className={this.state.active === 'TF' ? 'active' : ''} onClick={this.switchMetric.bind(this)}>
                        Twitter Followers
                        </Button>
                        <Button bsSize="small" refs="TM" className={this.state.active === 'TM' ? 'active' : ''} onClick={this.switchMetric.bind(this)}>
                        Twitter Mentions
                        </Button>
                        <Button bsSize="small" refs="FL" className={this.state.active === 'FL' ? 'active' : ''} onClick={this.switchMetric.bind(this)}>
                        Facebook Likes
                        </Button>
                        <Button bsSize="small" refs="FM" className={this.state.active === 'FM' ? 'active' : ''} onClick={this.switchMetric.bind(this)}>
                        Facebook Mentions
                        </Button>
                    </div>
                    <ControlLabel>Increase in {this.state.metricText}</ControlLabel>
                    <FormControl componentClass="select" onChange={this.setDates.bind(this)}>
                        {optionItems}
                    </FormControl><br/>

                    <svg className="line-chart"></svg> 
                </div>
            );
       } 
    }
}
export default ArtistMetrics;