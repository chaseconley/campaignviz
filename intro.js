(function(){
  
  // Set up all graph specs
  var margin = {top: 100, right: 20, bottom: 100, left: 40},
      width = 500 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;
    
  // Add the SVG to the page
  var svg = d3.select("#intro").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "intro")
      .attr("id", "intro_viz")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);
  
  var y = d3.scale.linear()
      .range([height, 0]);
  
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  
  var SI = d3.format("s");
  
  function shortNums(x) {
    var s = SI(x);
    switch (s[s.length - 1]) {
      case "G": return s.slice(0, -1) + "B";
      }
    return s;
  }
  
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10)
      .tickFormat(function(d){return "$" + shortNums(d)});
 
  d3.json("election_data.json", function(error, data) {
    x.domain(data.map(function(d) { return d.period; }));
    
    y.domain([0, d3.max(data, function(d) { return d.total; })]);
    
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis)
       .selectAll("text")
       .attr("class", "x-labels-election")  
       .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-65)");
       
    d3.selectAll(".x-labels-election")
       .text(function(d){return (d.charAt(0)=="*") ? "" : d;})
  
    svg.append("g")
       .attr("class", "axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("class", "y-axis-label-election")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Cumulative Total Donations");
       
    svg.selectAll(".points")
       .data(data)
       .enter()
       .append("circle")
       .attr("r", 3)
       .attr("cx", function(d) { return x(d.period) + width/data.filter(function(d){return d.cycle == 2012;}).length/3.2;})
       .attr("cy", function(d) { return y(d.total); })
       .attr("class", function(d){ return "c" + d.cycle; })
       .attr("fill", function(d) {
          switch(d.cycle){
            case "2012": return "black"; break;
            case "2016": return "deepskyblue"; break;
            case "space": return "none"; break;
          };
        })
    
    svg.append("circle")
       .attr("r", 3)
       .attr("cx", 350)
       .attr("cy", 200)
       .attr("fill", "black");
    
    svg.append("text")
       .attr("x", 360)
       .attr("y", 203)
       .text("2012 Election")
       .style("font-size", "10px");
       
    svg.append("circle")
       .attr("r", 3)
       .attr("cx", 350)
       .attr("cy", 220)
       .attr("fill", "deepskyblue");
    
    svg.append("text")
       .attr("x", 360)
       .attr("y", 223)
       .text("2016 Election")
       .style("font-size", "10px");
       
    svg.append("text")
       .attr("x", 305)
       .attr("y", 300)
       .text("Election Year")
       .style("font-size", "10px");

    svg.append("text")
       .attr("x", 70)
       .attr("y", 300)
       .text("Year Prior to Election")
       .style("font-size", "10px");
  
    
    
    

    



/*
  //Initialize the chart
  d3.select("#intro_viz")
    .select("g")
    .append("circle")
    .attr("cx", width/2)
    .attr("cy", height/2)
    .attr("r", 175)
    .attr("fill", "#A4CF87");
    
  d3.select("#intro_viz")
    .select("g")
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height/2)
    .style("font-size", "50px")
    .attr("dominant-baseline", "central")
    .attr("fill", "white")
    .text("$270M");
  
  d3.select("#intro_viz")
    .select("g")
    .append("circle")
    .attr("cx", width/2)
    .attr("cy", height/2+87.5)
    .attr("r", 87.5)
    .attr("fill", "#000000");
*/
  
  // Chart Transitions
  previous = 0;
  var gs = graphScroll()
    .container(d3.select('#container0'))
    .graph(d3.selectAll('#intro'))
    .sections(d3.selectAll('#sections0 > div'))
    .on('active', function(i){
      
      switch(i){  
        case 0:{
          console.log("0");
          d3.selectAll(".c2016")
            .style("visibility", "hidden")
            .attr("fill-opacity", 0);
        }
        break;
        
        case 1: {
          
          console.log("1");
          d3.selectAll(".c2016")
             .style("visibility", "visible");
             
          d3.selectAll(".c2016")
            .transition()
            .duration(500)
            .delay(function(d, i){return 500*i;})
            .attr("fill-opacity", 1);
        }
        break;
  
      }        
    });
  });
  
  d3.select('#source')
    .style({'margin-bottom': window.innerHeight - 500 + 'px', padding: '100px'})
})()
