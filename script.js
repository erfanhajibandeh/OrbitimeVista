document.addEventListener("DOMContentLoaded", function() {
    var friends = [
        { name: "EH", country: "Canada", city: "Vancouver", timezone: "America/Vancouver" },
        { name: "AK", country: "Canada", city: "Guelph", timezone: "America/Toronto" },
        { name: "SR", country: "Germany", city: "Offenburg", timezone: "Europe/Berlin" },
        { name: "PE", country: "Canada", city: "Guelph", timezone: "America/Toronto" },
        { name: "MM", country: "Canada", city: "Ottawa", timezone: "America/Toronto" },
        { name: "MS", country: "Canada", city: "Calgary", timezone: "America/Edmonton" },
        { name: "NS", country: "UK", city: "London", timezone: "Europe/London" },
        { name: "MH", country: "Iran", city: "Tehran", timezone: "Asia/Tehran" }
    ];

    var svgWidth = Math.min(800, window.innerWidth - 20), // 800 or less depending on viewport width
    svgHeight = Math.min(600, window.innerHeight - 20); // 600 or less depending on viewport height

    var radiusIncrement = 20; 
    var centerOffsetX = svgWidth / 2; 
    var centerOffsetY = svgHeight / 2; 

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

    // Function to show tooltip
    function showTooltip(event, friend) {
        tooltip.style("opacity", 1);
        var now = new Date().toLocaleString("en-US", {timeZone: friend.timezone});
        now = new Date(now);
        tooltip.html(friend.name + " - " + friend.city + ", " + friend.country + "<br/>" + now.toLocaleTimeString())
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    // Function to hide tooltip
    function hideTooltip() {
        tooltip.style("opacity", 0);
    }

    function createMovingCircles() {
        var movingCirclesCount = 10; 
    
        for (var i = 0; i < movingCirclesCount; i++) {
            animateMovingCircle();
        }
    }
    
    function animateMovingCircle() {
        var duration = 3000 + Math.random() * 3000; // Random duration between 2000 and 5000 milliseconds for each animation cycle
        var startX = Math.random() * svgWidth - svgWidth  + centerOffsetX;
        var startY = Math.random() * svgHeight - svgHeight + centerOffsetY;
        var endX = Math.random() * svgWidth - svgWidth+ centerOffsetX;
        var endY = Math.random() * svgHeight - svgHeight + centerOffsetY;
        var colors = ["blue", "black", "red"]; // Array of color options
        var randomColor = colors[Math.floor(Math.random() * colors.length)];

        var circle = svg.append("circle")
            .attr("cx", startX)
            .attr("cy", startY)
            .attr("r", Math.random() + 1)
            .style("fill", randomColor); 
    
        // Animate movement from start to end position
        (function repeat() {
            circle
                .transition()
                .duration(duration)
                .attr("cx", endX)
                .attr("cy", endY)
                .ease(d3.easeLinear)
                .on("end", function() {
                    // Reset positions for continuous movement
                    startX = Math.random() * svgWidth - svgWidth  + centerOffsetX;
                    startY = Math.random() * svgHeight - svgHeight + centerOffsetY;
                    endX = Math.random() * svgWidth - svgWidth+ centerOffsetX;
                    endY = Math.random() * svgHeight - svgHeight + centerOffsetY;
                    
                    circle.attr("cx", startX).attr("cy", startY); // Move circle back without animation
    
                    repeat();
                });
        })();
    }

    function generateComet() {
        var targets = svg.selectAll(".friend-circle").nodes();
        var targetIndex = Math.floor(Math.random() * targets.length);
        var target = d3.select(targets[targetIndex]);
        var colors = ["blue", "black", "red"]; // Array of color options
        var randomColor = colors[Math.floor(Math.random() * colors.length)];
    
        // Randomly choose an edge: 0 = top, 1 = right, 2 = bottom, 3 = left
        let edge = Math.floor(Math.random() * 4);
    
        let startX, startY;
        switch (edge) {
            case 0: // Start from top
                startX = Math.random() * svgWidth;
                startY = -20; // Just above the SVG
                break;
            case 1: // Start from right
                startX = svgWidth + 20;
                startY = Math.random() * svgHeight;
                break;
            case 2: // Start from bottom
                startX = Math.random() * svgWidth;
                startY = svgHeight + 20;
                break;
            case 3: // Start from left
                startX = -20;
                startY = Math.random() * svgHeight;
                break;
        }
    
        let endX = parseFloat(target.attr("cx")) + centerOffsetX;
        let endY = parseFloat(target.attr("cy")) + centerOffsetY;
    
        var comet = d3.select("#visualization").select("svg").append("circle")
            .attr("cx", startX)
            .attr("cy", startY)
            .attr("r", Math.random() + 1.3)
            .style("fill", randomColor)
            .transition()
            .ease(d3.easeLinear) 
            .style("filter", "url(#spark-effect)") 
            .duration(Math.random() *10000)
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
    var daytimeFriendsCount = 0;
    // function to define planets (firends)
    friends.forEach(function(friend, index) {
        var now = new Date().toLocaleString("en-US", {timeZone: friend.timezone});
        now = new Date(now);
        if (isDaytime(now)) {
            daytimeFriendsCount++;}
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
            .style("filter", "url(#spark-effect)") 
            .style("stroke-width", 2);

        // Draw background circle for initials (simulating sun/moon)
        var backgroundCircle = svg.append("circle")
            .attr("cx", namePositionX)
            .attr("cy", namePositionY)
            .attr("r", 9) 
            .style("fill", circleColor)
            .attr("class", "friend-circle") 
            .on("mouseover", function(event) {
                d3.select(this).transition()
                    .duration(200)
                    .attr("r", 12); // Increased radius on mouseover
                showTooltip(event, friend);
            })
            .on("mouseout", function() {
                d3.select(this).transition()
                    .duration(200)
                    .attr("r", 9); // Revert to original radius
                hideTooltip();
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
    // Check if all friends are in daytime and display a sign if true
    if (daytimeFriendsCount === friends.length) {
        displayAllDaytimeSign();
    }

    function displayAllDaytimeSign() {

        svg.append("text")
            .attr("x", 0) 
            .attr("y", -200)
            .attr("text-anchor", "middle")
            .text("All Available!")
            .style("fill", "red") 
            .style("font-size", "24px") 
            .attr("class", "daytime-sign"); 
    }
    setInterval(function() {
        generateComet(); 
    }, 3500);   
    createMovingCircles();
});
