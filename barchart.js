(function(){
  
  // Placeholders for chart-wide accessible data
  var candidate_data = null;
  var party_data = null;
  
  // Set up all grpah specs
  var margin = {top: 100, right: 20, bottom: 100, left: 40},
      width = 500 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;
  
  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);
  
  var y = d3.scale.linear()
      .range([height, 0]);
  
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  
  var shortNums = d3.format("s");
  
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10)
      .tickFormat(function(d){return "$" + shortNums(d)});
      
  var barOpacity = d3.scale.linear().range([0.2,1]);
  
  var barColors = d3.scale.ordinal().domain(["R","D"]).range(["brown", "steelblue"])
  
  var commasFormatter = d3.format(",.0f");
  
  // Intitialize Tooltip 
  var tooltipData = 0;
  
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      switch(tooltipData){
        case 0: valueToShow = d.individual_total; break;
        case 1: valueToShow = d.cand_total; break;
        case 2: valueToShow = d.pac_total; break;
        case 3: valueToShow = d.total_contributions; break;
      }
      return "<strong>" + d.cand_nm +":<\/strong> <span>$" + commasFormatter(valueToShow) + "<\/span>";
    })
  
  // Add the SVG to the page
  var svg = d3.select("#graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "bar-chart")
      .attr("id", "viz")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .on("mouseover", function(){d3.select(".encouragement").transition().duration(500).style("fill-opacity", 0);
                                  d3.select(".encouragement").transition().delay(500).style("visibility", "hidden");});
  
  svg.call(tip);
  
  //Initialize the chart
  
  d3.json("data.json", function(error, data) {
    if (error) throw error;
    
    // Hoist data so all barchart functions can use it.
    candidate_data = data;
    
    // Data Processing
    data.forEach(function(d){d.total_contributions = d.cand_total + d.individual_total + d.pac_total}); // Compute Total
    
    party_data = [];
    
    var temp = {party: "R", total: data.filter(function(d){return d.party=="R"}).reduce(function(a, b) {return parseInt(a,10) + parseInt(b.total_contributions, 10);}, 0)};
    party_data.push(temp);   
      
    var temp = {party: "D", total: data.filter(function(d){return d.party=="D"}).reduce(function(a, b) {return parseInt(a,10) + parseInt(b.total_contributions, 10);}, 0)};
    party_data.push(temp);
    
    // Make Graph
    x.domain(data.map(function(d) { return d.cand_nm; }));
    y.domain([0, d3.max(data, function(d) { return d.individual_total; })]);
    
    barOpacity.domain([0, d3.max(data, function(d) { return d.individual_total; })]);
  
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis)
       .selectAll("text")  
       .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-65)");
  
    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("class", "y-axis-label")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Total of Individual Contributions");
  
    svg.selectAll(".bar")
       .data(data)
       .enter().append("rect")
       .attr("class", "bar")
       .attr("x", function(d) { return x(d.cand_nm); })
       .attr("width", x.rangeBand())
       .attr("y", function(d) { return y(d.individual_total); })
       .attr("height", function(d) { return height - y(d.individual_total); })
       .style("fill", function(d){return barColors(d.party)})
       .style("fill-opacity", 0.75/* function(d){return barOpacity(d.individual_total)} */)
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide);
        
    svg.selectAll(".cand-bar")
       .data(data)
       .enter().append("rect")
       .attr("class", "cand-bar")
       .attr("x", function(d) { return x(d.cand_nm); })
       .attr("width", x.rangeBand())
       .attr("y", function(d) { return y(d.cand_total)-(height -y(d.individual_total)); })
       .attr("height", function(d) { return height - y(d.cand_total); })
       .style('visibility', 'hidden')
       .style("fill", function(d){return barColors(d.party)})
       .style("fill-opacity", 0/* function(d){return barOpacity(d.individual_total)} */)
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide);
        
    svg.selectAll(".pac-bar")
       .data(data)
       .enter().append("rect")
       .attr("class", "pac-bar")
       .attr("x", function(d) { return x(d.cand_nm); })
       .attr("width", x.rangeBand())
       .attr("y", function(d) { return y(d.pac_total)-(height -y(d.individual_total))-(height-y(d.cand_total)); })
       .attr("height", function(d) { return height - y(d.pac_total); })
       .style('visibility', 'hidden')
       .style("fill", function(d){return barColors(d.party)})
       .style("fill-opacity", 0/* function(d){return barOpacity(d.individual_total)} */)
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide);
        
    svg.append("text")
       .attr("class", "encouragement")
       .attr("text-anchor", "middle")
       .attr("x", width/2)
       .attr("y", height/2)
       .style("fill", "grey")
       .text("Hover to Interact")
       
        
  });
  
  // Chart Transitions
  
  var gs = graphScroll()
    .container(d3.select('#container'))
    .graph(d3.selectAll('#graph'))
    .sections(d3.selectAll('#sections > div'))
    .on('active', function(i){
      console.log(i);
      switch(i){
        case 0: {
          console.log("At 0");
          var runningTotal = -(height - y(13557574));
          d3.select(".bar-chart")
          .selectAll(".bar")
          .transition()
          .duration(500)
          .attr("transform", "translate(0,0)")
          .style("fill-opacity", 0.75);
        };
        break;
        case 1: {
          console.log("At 1");
          var runningTotal = -(height - y(13557574));
          d3.select(".bar-chart")
          .selectAll(".bar")
          .transition()
          .duration(500)
          .attr("transform", "translate(0,0)")
          .style("fill-opacity", function(d){
            if (d.individual_total < 15000000 || d.individual_total > 60000000){
              return 0.75;
            }else{
              return 0.3;
            }
            });
        };
        break;
        case 2: {
          console.log("At 2");
           var runningTotal = -(height - y(13557574));
          d3.select(".bar-chart")
          .selectAll(".bar")
          .transition()
          .duration(2000)
          .attr("transform", function(d){ 
            if (x(d.cand_nm)<x("Marco Rubio")){
              transform = runningTotal;
              runningTotal -=  (height - y(d.individual_total));
              return "translate(" + (x("Marco Rubio")-x(d.cand_nm)) + "," + transform +")";
            } else{
              return "translate(0,0)";
            }
          });
        };     
        break;     
        case 3: {
          console.log("At 3");
          var runningTotal = -(height - y(13557574));
          d3.select(".bar-chart")
          .selectAll(".bar")
          .transition()
          .duration(2000)
          .attr("transform", "translate(0,0)")
          .style("fill-opacity", 0.75);
          
          d3.select(".bar-chart")
            .selectAll(".cand-bar")
            .transition()
            .duration(2000)
            .attr("transform", "translate(0,0)")
            .style("fill-opacity", 0);
          
          d3.select(".bar-chart")
            .selectAll(".cand-bar")
            .transition()
            .duration(2000)
            .delay(2000)
            .attr("transform", "translate(0,0)")
            .style("visilibility", "hidden");
          
          d3.select(".y-axis-label")
            .transition()
            .text("Total Individual Contributions")
          
          tooltipData = 0;
        };
        break;
        case 4: {
          console.log("At 4");
          d3.select(".bar-chart")
            .selectAll(".cand-bar")
            .transition()
            .duration(2000)
            .style("visibility", "visible")
            .style("fill-opacity", 0.75);
          
          d3.select(".bar-chart")
            .selectAll(".bar")
            .transition()
            .duration(2000)
            .style("fill-opacity", 0.3);
            
          d3.select(".bar-chart")
            .selectAll(".pac-bar")
            .transition()
            .duration(2000)
            .style("visibility", "visible")
            .style("fill-opacity", 0);
          
          d3.select(".bar-chart")
            .selectAll(".pac-bar")
            .transition()
            .duration(2000)
            .delay(2000)
            .attr("transform", "translate(0,0)")
            .style("visilibility", "hidden");
          
          d3.select(".y-axis-label")
            .transition()
            .delay(2000)
            .text("Total Individual & Candidate Contributions")
          
          tooltipData = 1;
        };
        break;
        case 5: {
          console.log("At 5");
          d3.select(".bar-chart")
            .selectAll(".pac-bar")
            .transition()
            .duration(2000)
            .style("visibility", "visible")
            .style("fill-opacity", 0.75);
          
          d3.select(".bar-chart")
            .selectAll(".cand-bar")
            .transition()
            .duration(2000)
            .style("fill-opacity", 0.3);
          
          d3.select(".bar-chart")
            .selectAll(".bar")
            .transition()
            .duration(2000)
            .style("fill-opacity", 0.3);
            
          d3.select(".bar-chart")
            .selectAll('.bar')
            .attr("y", function(d) { return y(d.individual_total); })
            .attr("height", function(d) { return height - y(d.individual_total); })
            
          d3.select(".bar-chart")
            .selectAll(".cand-bar")
            .style("visibility", "visible");
          
          d3.select(".bar-chart")
            .selectAll(".pac-bar")
            .style("visibility", "visible");
          
          d3.select(".y-axis-label")
            .transition()
            .delay(2000)
            .text("Total Contributions")
          
          tooltipData = 2;
        };
        break;
        
        case 6: {
          console.log("At 6");
          d3.select(".bar-chart")
            .selectAll(".bar")
            .transition()
            .duration(2000)
            .style("visibility", "visible")
            .style("fill-opacity", 0.75);
          
          d3.select(".bar-chart")
            .selectAll(".cand-bar")
            .transition()
            .duration(2000)
            .style("fill-opacity", 0.75);
            
          d3.select(".bar-chart")
            .selectAll('.bar')
            .transition()
            .duration(1)
            .delay(2000)
            .attr("y", function(d) { return y(d.total_contributions); })
            .attr("height", function(d) { return height - y(d.total_contributions); })
            
          d3.select(".bar-chart")
            .selectAll(".cand-bar")
            .transition()
            .duration(0)
            .delay(2000)
            .style("visibility", "hidden");
          
          d3.select(".bar-chart")
            .selectAll(".pac-bar")
            .transition()
            .duration(0)
            .delay(2000)
            .style("visibility", "hidden");
            
          tooltipData = 3;
  
        };
        break;
        
        case 7: {
          console.log("At 7");
          y.domain([0, d3.max(party_data, function(d){return d.total;})]);
          d3.select(".y").transition().duration(1000).ease("bounce").call(yAxis);
          
          d3.selectAll(".bar")
            .transition()
            .ease("bounce")
            .duration(1000)
            .attr("y", function(d) { return y(d.total_contributions); })
            .attr("height", function(d) { return height - y(d.total_contributions); })
          
        };
        break;
        
        case 8: {
          console.log("At 8");
         var dRunningTotal = -(height - y(76045487));
         var rRunningTotal = -(height - y(31275992));
          d3.selectAll(".bar")
            .transition()
            .duration(2000)
            .attr("transform", function(d){ 
              if (d.party == "D" && d.cand_nm != "Hillary Clinton"){
  
                transform = dRunningTotal;
                                console.log(d.cand_nm + transform);
                dRunningTotal -=  (height - y(d.total_contributions));
                return "translate(" + (x("Hillary Clinton")-x(d.cand_nm)) + "," + transform +")";
              }else if (d.party == "R" && d.cand_nm != "Ben Carson"){
                transform = rRunningTotal;
                console.log(d.cand_nm + transform);
                rRunningTotal -=  (height - y(d.total_contributions));
                return "translate(" + (x("Ben Carson")-x(d.cand_nm)) + "," + transform +")";
              } else{
                return "translate(0,0)";
              }
            });
        };
        break;
  
  
  
  
      }        
    })
  
  d3.select('#source')
    .style({'margin-bottom': window.innerHeight - 500 + 'px', padding: '100px'})
})()
