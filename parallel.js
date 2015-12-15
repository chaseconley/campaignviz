(function(){
d3.json("employment.json", function(error, data) {


var margin =  {top: 0, right: 0, bottom: 0, left: 0},
    /*{top: 50, right: 50, bottom: 150, left: 100},*/
    width = 500 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var pc = d3.parcoords()("#graph2")
  .data(data)
  .color(function(d){
      if (d.party == 'R') return 'brown';
      else if (d.party == 'D') return 'steelblue';
      else if (d.party == 'both') return 'black';
      else return 'white';//rgba('0,0,0,0');
  })
  .hideAxis(["cand_name", "party"]) //hides axis for candname, but it stays in dataset
  .margin({top:80,left:0,bottom:50, right:0})
  .render()
  .ticks(3)
  //.createAxes()
  .brushMode("1D-axes")
  .reorderable();
  //.interactive();
console.log("data ", data);
//add hover event
d3.select("#graph2")
	.on("mousemove", function() {

            console.log("on mousemove");
	    var mousePosition = d3.mouse(this);			    
	    highlightLineOnClick(mousePosition, true); //true will also add tooltip
	})
	.on("mouseout", function(){
		cleanTooltip();
		pc.unhighlight();
	});

d3.selectAll(".label").attr("transform", "translate(0,-25)");


// Add highlight for every line on click
function getCentroids(data){
	// this function returns centroid points for data. I had to change the source
	// for parallelcoordinates and make compute_centroids public.
	// I assume this should be already somewhere in graph and I don't need to recalculate it
	// but I couldn't find it so I just wrote this for now
	var margins = pc.margin();
	var graphCentPts = [];
	
	data.forEach(function(d){
		var initCenPts = pc.compute_centroids(d).filter(function(d, i){return i%2==0;});	
		// move points based on margins
		var cenPts = initCenPts.map(function(d){
			return [d[0] + margins["left"], d[1]+ margins["top"]]; 
		});
		graphCentPts.push(cenPts);
	});
	return graphCentPts;
}


function getActiveData(){
	if (pc.brushed()!=false) return pc.brushed();
	return pc.data();
}
function isOnLine(startPt, endPt, testPt, tol){
	// check if test point is close enough to a line
	// between startPt and endPt. close enough means smaller than tolerance
	var x0 = testPt[0];
	var y0 = testPt[1];
	var x1 = startPt[0];
	var y1 = startPt[1];
	var x2 = endPt[0];
	var y2 = endPt[1];
	var Dx = x2 - x1;
	var Dy = y2 - y1;
	var delta = Math.abs(Dy*x0 - Dx*y0 - x1*y2+x2*y1)/Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2)); 
	if (delta <= tol) return true;
	return false;
}

function findAxes(testPt, cenPts){
	// finds between which two axis the mouse is
	var x = testPt[0];
	var y = testPt[1];

	// make sure it is inside the range of x
	if (cenPts[0][0] > x) return false;
	if (cenPts[cenPts.length-1][0] < x) return false;

	// find between which segment the point is
	for (var i=0; i<cenPts.length; i++){
  	    if (cenPts[i][0] > x) return i;
	}
}

function cleanTooltip(){
	// removes any object under #tooltip is
	pc.svg.selectAll("#tooltip")
    	.remove();
}

function addTooltip(clicked, clickedCenPts){
    // sdd tooltip to multiple clicked lines
    var clickedDataSet = [];
    var margins = pc.margin()
    var text = "";

    // get all the values into a single list
    for (var i=0; i<1; i++){  // i<clicked.length will put tooltips on multiple selected lines 
        var added_name = false;
    	for (var j=0; j<clickedCenPts[i].length; j++){  //Uncomment to have multiple axes with tooltips
                if (!added_name){
                    clickedDataSet.push([clickedCenPts[i][1][0] - margins.left, 50, d3.values(clicked[i])[0] ]);
                    added_name = true;
                }
    		var text = d3.format(",.1%")(d3.values(clicked[i])[j+1]/100);
  		var x = clickedCenPts[i][j][0] - margins.left;
  		var y = clickedCenPts[i][j][1] - margins.top;
  		clickedDataSet.push([x, y, text]);
	}
    };

    // add rectangles
    var fontSize = 12;
    var padding = 2;
    var rectHeight = fontSize + 2 * padding; //based on font size

    pc.svg.selectAll("rect[id='tooltip']")
        	.data(clickedDataSet).enter()
        	.append("rect")
        	.attr("x", function(d) { return d[0] - d[2].length * 5;})
		.attr("y", function(d) { return d[1] - rectHeight + 2 * padding; })
		.attr("rx", "2")
		.attr("ry", "2")
		.attr("id", "tooltip")
		.attr("fill", "grey")
		.attr("opacity", 0.9)
		.attr("width", function(d){return d[2].length * 10;})
		.attr("height", rectHeight);

    // add text on top of rectangle
    pc.svg.selectAll("text[id='tooltip']")
    .data(clickedDataSet).enter()
    		.append("text")
		.attr("x", function(d) { return d[0];})
		.attr("y", function(d) { return d[1]; })
		.attr("id", "tooltip")
		.attr("fill", "white")
		.attr("text-anchor", "middle")
		.attr("font-size", fontSize)
        	.text( function (d){ return d[2];})    
}

function getClickedLines(mouseClick){
    var clicked = [];
    var clickedCenPts = [];

    // find which data is activated right now
    var activeData = getActiveData();

    // find centriod points
    var graphCentPts = getCentroids(activeData);

    if (graphCentPts.length==0) return false;

    // find between which axes the point is
    var axeNum = findAxes(mouseClick, graphCentPts[0]);
    if (!axeNum) return false;
    
    graphCentPts.forEach(function(d, i){
       if (isOnLine(d[axeNum-1], d[axeNum], mouseClick, 2)){
       	   clicked.push(activeData[i]);
	   clickedCenPts.push(graphCentPts[i]); // for tooltip
        }
    });
	
    return [clicked, clickedCenPts]
}

function highlightLineOnClick(mouseClick, drawTooltip){
	
    var clicked = [];
    var clickedCenPts = [];
	
    clickedData = getClickedLines(mouseClick);

    if (clickedData && clickedData[0].length!=0){

	clicked = clickedData[0];
    	clickedCenPts = clickedData[1];

        // highlight clicked line
        pc.highlight(clicked);
        console.log("Clicked ", clicked);	

	
	if (drawTooltip){
    	    // clean if anything is there
	    cleanTooltip();
	    // add tooltip
	    addTooltip(clicked, clickedCenPts);
	}
    }
};



var gs2 = graphScroll()
  .container(d3.select("#container2"))
  .graph(d3.selectAll("#graph2"))
  .sections(d3.selectAll("#sections2 > div"))
  .on("active", function(i){

  });


// Transitions
previous = 0;
var gs = graphScroll()
    .container(d3.select('#container2'))
    .graph(d3.selectAll('#graph2'))
    .sections(d3.selectAll('#sections > div'))
    .on('active', function(i){
     
      var highlight = data.filter(function(d){return d.cand_name!=""});
      var prev = -1;
 
      switch(i){
        case 0: {
	  cleanTooltip();
          pc.unhighlight();
        };
        break;
        case 1: {
          highlight = data.filter(function(highlight){return highlight.cand_name=="Average"});
          pc.highlight(highlight);
          var centPtsForTTip = getCentroids(highlight);
	  addTooltip(highlight, centPtsForTTip);
          prev = 1;
        };
        break;
        case 2: {
          pc.unhighlight();
          cleanTooltip();
          highlight = data.filter(function(highlight){return highlight.party=="R"});
          pc.highlight(highlight);
          prev = 2;
        };
        break;
        case 3: {
          cleanTooltip();
          highlight = data.filter(function(highlight){return highlight.party=="D"});
          pc.highlight(highlight);
          prev = 3;
        };
        break;
        case 4: {
          highlight = data.filter(function(highlight){return highlight.cand_name=="Bernie Sanders"});
          pc.highlight(highlight);
          var centPtsForTTip = getCentroids(highlight);
	  addTooltip(highlight, centPtsForTTip);
        };
        break;
        case 5: {
          pc.unhighlight();
          cleanTooltip();
        };
      }
    });

});
})()
