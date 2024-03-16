document.addEventListener("DOMContentLoaded", function() {
    var friends = [
        { name: "EH", country: "Canada", city: "Vancouver", timezone: "America/Vancouver" },
        { name: "MM", country: "Canada", city: "Ottawa", timezone: "America/Toronto" },
        { name: "AK", country: "Canada", city: "Guelph", timezone: "America/Toronto" },
        { name: "PE", country: "Canada", city: "Guelph", timezone: "America/Toronto" },
        { name: "MS", country: "Canada", city: "Calgary", timezone: "America/Edmonton" },
        { name: "NS", country: "UK", city: "London", timezone: "Europe/London" },
        { name: "SR", country: "Germany", city: "Offenburg", timezone: "Europe/Berlin" },
        { name: "MH", country: "Iran", city: "Tehran", timezone: "Asia/Tehran" }
    ];

    var svgWidth = 800, svgHeight = 650;
    var radiusIncrement = 20; 
    var centerOffsetX = svgWidth / 2.15; 
    var centerOffsetY = svgHeight / 1.5; 

    var svg = d3.select("#visualization").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${centerOffsetX},${centerOffsetY})`);

    var tooltip = d3.select(".tooltip");

    // Define spark effect
    var sparkDefs = svg.append("defs");
    var sparkFilter = sparkDefs.append("filter")
        .attr("id", "spark-effect")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    sparkFilter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 3)
        .attr("result", "blur");
    sparkFilter.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "blur")
        .attr("mode", "lighten");

    // Define glow effect
    var glowDefs = svg.append("defs");
    var glowFilter = glowDefs.append("filter")
        .attr("id", "glow-effect")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    glowFilter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 4)
        .attr("result", "blur");
    glowFilter.append("feComponentTransfer")
        .append("feFuncA")
        .attr("type", "linear")
        .attr("slope", 4);
    var glowMerge = glowFilter.append("feMerge");
    glowMerge.append("feMergeNode");
    glowMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    function generateComet() {
        var targets = svg.selectAll(".friend-circle").nodes();
        var targetIndex = Math.floor(Math.random() * targets.length);
        var target = d3.select(targets[targetIndex]);
    
        let startX = svgWidth; // Starting just off the right edge
        let startY = Math.random() * svgHeight; // Random vertical start position
    
        let endX = parseFloat(target.attr("cx")) + centerOffsetX +10;
        let endY = parseFloat(target.attr("cy")) + centerOffsetY ;
    
        // Adjusting the comet to be added directly to the SVG, ensuring it's not affected by the group's transform
        var comet = d3.select("#visualization").select("svg").append("circle")
            .attr("cx", startX)
            .attr("cy", startY)
            .attr("r", 4) 
            .style("fill", "black")
            .transition()
            .duration(1500)
            .attr("cx", endX)
            .attr("cy", endY)
            .on("end", function() {
                impactEffect(target);
                d3.select(this).remove();
            });
    }
    
    function impactEffect(target) {
        let originalColor = target.style("fill"); 
        target.transition()
            .duration(500)
            .style("fill", "red") 
            .transition()
            .duration(1000)
            .style("fill", originalColor); 
    }
    
    // Check to see if it is day or night
    function isDaytime(now) {
        return now.getHours() >= 6 && now.getHours() < 20;
    }

    // function to define planets (firends)
    friends.forEach(function(friend, index) {
        var now = new Date().toLocaleString("en-US", {timeZone: friend.timezone});
        now = new Date(now);
        var daytime = isDaytime(now);
        var color = daytime ? "gold" : "black";
        var circleColor = daytime ? "gold" : "grey";
        var radius = (index + 1) * radiusIncrement;
        
        // Calculate position for name initials
        var hour = now.getHours() + now.getMinutes() / 60;
        var angle = ((hour % 12) / 12) * 2 * Math.PI - Math.PI / 2;
        var namePositionX = radius * Math.cos(angle);
        var namePositionY = radius * Math.sin(angle);

        // Draw circle
        var circle = svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius)
            .style("fill", "none")
            .style("stroke", color)
            .style("stroke-width", 2);

        // Draw background circle for initials (simulating sun/moon)
        var backgroundCircle = svg.append("circle")
            .attr("cx", namePositionX)
            .attr("cy", namePositionY)
            .attr("r", 9) 
            .style("fill", circleColor)
            .attr("class", "friend-circle") 
            .on("mouseover", function() {
                d3.select(this).transition()
                    .duration(200)
                    .attr("r", 12);
            })
            .on("mouseout", function() {
                d3.select(this).transition()
                    .duration(200)
                    .attr("r", 9);
            });
        // Draw text (initials)
        var text = svg.append("text")
            .attr("x", namePositionX)
            .attr("y", namePositionY)
            .attr("dy", ".35em") 
            .attr("text-anchor", "middle")
            .text(friend.name)
            .style("fill", daytime ? "black" : "white") 
            .style("font-size", "8px") 
            .style("font-weight", "bold")
            .on("mouseover", function(event) {
                tooltip.style("opacity", 1);
                tooltip.html(friend.name + " - " + friend.city + ", " + friend.country + "<br/>" + now.toLocaleTimeString())
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });

        // Apply spark effect for black circles
        if (!daytime) {
            backgroundCircle.style("filter", "url(#spark-effect)");
        }

        // Apply glow effect for yellow circles
        if (daytime) {
            backgroundCircle.style("filter", "url(#glow-effect)");
        }
    });

    // Draw clock hours and tick marks
    var lastRadius = friends.length * radiusIncrement; 
    for (var hour = 1; hour <= 12; hour++) {
        var angle = (hour / 12) * 2 * Math.PI - Math.PI / 2;
        var hourPositionX = (lastRadius + 10) * Math.cos(angle); 
        var hourPositionY = (lastRadius + 10) * Math.sin(angle);
        var tickX1 = (lastRadius + 2) * Math.cos(angle);
        var tickY1 = (lastRadius + 2) * Math.sin(angle);
        var tickWidth = 1; 
        var tickColor = "gray"; 

        // Draw tick mark
        svg.append("line")
            .attr("x1", tickX1)
            .attr("y1", tickY1)
            .attr("x2", hourPositionX)
            .attr("y2", hourPositionY)
            .style("stroke", tickColor)
            .style("stroke-width", tickWidth);

        // Draw hour label
        svg.append("text")
            .attr("x", hourPositionX * 1.05) 
            .attr("y", hourPositionY * 1.05) 
            .attr("text-anchor", "middle")
            .text(hour)
            .style("fill", "black")
            .style("font-size", "14px"); 
    }
    setInterval(function() {
        generateComet(); 
    }, 2000);   
    
});
