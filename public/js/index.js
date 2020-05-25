// Get references to page elements
var chartCounter = 0; // initialize, updates in showChart()
var chartTotal = 0; // store number of data sets (each display chart), updates on first showChart()
var $exampleText = $("#example-text");
var $exampleDescription = $("#example-description");
var $submitBtn = $("#submit");
var $exampleList = $("#example-list");

$(document).ready(function() {
    $("#next-button").hide();
    $("#chart-container").hide();
    $("#button-container").hide();
    
});

$("#getstarted-button").on("click", function() {
        
        showChart(chartCounter);
        
        $("#chart-container").show();
    
        $("#getstarted-button").hide();
        
        setTimeout(function() {
            document.getElementById("chart-container").scrollIntoView({
                block: "start",
                behavior: "smooth"
            });
            $("#button-container").show();    
        }, 200);
        
});

$("#correlation-button").on("click", function () {
  $.ajax({
    type: "POST",
    url: "/api/data/correlation/" + chartCounter,
    data: {},
    success: function () {
      console.log("correlation");
    }
  }).then(votes => {
    // console.log("new votes: ", votes.correlation_votes, votes.causation_votes);
    showVotes(votes.correlation_votes, votes.causation_votes);
  });
});

$("#causation-button").on("click", function () {
  $.ajax({
    type: "POST",
    url: "/api/data/causation/" + chartCounter,
    data: {},
    success: function () {
      console.log("causation")
    }
  }).then(votes => {
    // console.log("new votes: ", votes.correlation_votes, votes.causation_votes);
    showVotes(votes.correlation_votes, votes.causation_votes);
  });
});

$("#next-button").on("click", function() {
    $("#next-button").hide(); 
    $("#button-container").hide();
    $("#chart-container").addClass("slide-out-right");
    showChart();
    setTimeout(function() {
        $("#button-container").show();
        $("#chart-container").removeClass("slide-out-right");
        $("#chart-container").addClass("slide-in-left");
        document.getElementById("chart-container").scrollIntoView({
            block: "start",
            behavior: "smooth"
        });
        
    }, 500);
});

function showVotes(corrVotes, causVotes) {
    $("#causation-button").hide();
    $("#correlation-button").hide();
    $(".bar-div").show();
    
    let corrPerc = Math.round((corrVotes / (corrVotes + causVotes)) * 100);
    let causPerc = Math.round((causVotes / (corrVotes + causVotes)) * 100);
    $("#correlation-bar").css("width", corrPerc);
    $("#causation-bar").css("width", causPerc);
    $(".vote-percentage").remove();
    $(".corr-bar-div").append($("<div>").addClass("vote-percentage").text(corrPerc + "%"));
    $(".caus-bar-div").append($("<div>").addClass("vote-percentage").text(causPerc + "%"));
    
    $("#correlation-div").append($("<p>").text("Correlation"));
    $("#causation-div").append($("<p>").text("Causation"));
    // animate vote percentage bars
    // $(".progress").each(function() {
    //     var $percent = $(this).css("width") * 0.8;
    //      $(this).animate(
    //      {width:$percent+"%"},
    //      {duration: 5000});
    // });

    if (chartCounter < totalCharts) {
        $("#next-button").show();
    } else {
        // $("#button-container").empty();
        $("#button-container").append($("<p>").text("Thanks for voting!"));
    }
};

function showChart() {
        chartCounter += 1;
        $.get("/api/chartdata/" + chartCounter, (data) => {
            if (chartTotal === 0) totalCharts = data.data.maxCharts || 3;
            var lineChartData = {
                labels: data.data.labels1,
                datasets: [{
                    label: data.data.Name1,
                    borderColor: 'rgb(237, 55, 91)',
                    // backgroundColor: window.chartColors.red,
                    fill: false,
                    data: data.data.values1,
                    yAxisID: "y-axis-1",
                }, {
                    label: data.data.Name2,
                    borderColor: 'rgb(55, 179, 237)',
                    // backgroundColor: window.chartColors.blue,
                    fill: false,
                    data: data.data.values2,
                    yAxisID: "y-axis-2"
                }]
            };

            var ctx = document.getElementById("myChart").getContext("2d");
            
            window.myLine = Chart.Line(ctx, {
                data: lineChartData,
                options: {
                    responsive: true,
                    hoverMode: 'index',
                    stacked: false,
                    defaultFontSize: 16,
                    title: {
                        display: true,
                        text: 'Causation or Correlation',
                        fontSize: 16 
                    },
                    labels: { defaultFontSize: 16},
                    scales: {
                        yAxes: [{
                            type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: "left",
                            id: "y-axis-1",
                        }, {
                            type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: "right",
                            id: "y-axis-2",

                            // grid line settings
                            gridLines: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        }],
                        fontSize: 16
                    }
                }
            });
        }).then((data) => {
            
        });
        Chart.defaults.global.defaultFontSize = 16;
        
        $("#next-button").hide();
        $("#correlation-div").find("p").remove();
        $("#causation-div").find("p").remove();
        $(".bar-div").hide();
        $("#chart-container").show();
        $("#causation-button").show();
        $("#correlation-button").show();

};

