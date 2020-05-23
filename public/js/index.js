// Get references to page elements
var chartCounter = 1;
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
        $("#button-container").show();
        $("#getstarted-button").hide();
        setTimeout(function() {
            document.getElementById("button-container").scrollIntoView({
                block: "end",
                behavior: "smooth"
            });
        }, 200);
        
});

$("#next-button").on("click", function() {
    $("#next-button").hide();
    $("#chart-container").hide();
    $("#button-container").hide();
    chartCounter += 1;
    showChart(chartCounter);
})

$("#correlation").on("click", function () {
  console.log("click");
  $.ajax({
    type: "POST",
    url: "/api/data/correlation/" + chartCounter,
    data: {},
    success: function () {
      console.log("correlation");
    }
  }).then(votes => {
    console.log("new votes: ", votes.correlation_votes, votes.causation_votes);
    sessionStorage.setItem("correlation_votes", votes.correlation_votes);
    sessionStorage.setItem("causation_votes", votes.causation_votes);
    $("#causation").hide();
    $("#correlation").hide();
    $("#correlation-div").append($("<p>").text("Correlation Votes: " + votes.correlation_votes));
    $("#causation-div").append($("<p>").text("Causation Votes: " + votes.causation_votes));
    $("#next-button").show();
  });
});

$("#causation").on("click", function () {
  console.log("click");
  $.ajax({
    type: "POST",
    url: "/api/data/causation/" + chartCounter,
    data: {},
    success: function () {
      console.log("causation")
    }
  }).then(votes => {
    console.log("new votes: ", votes.correlation_votes, votes.causation_votes);
    sessionStorage.setItem("correlation_votes", votes.correlation_votes);
    sessionStorage.setItem("causation_votes", votes.causation_votes);
    $("#causation").hide();
    $("#correlation").hide();
    $("#correlation-div").append($("<p>").text("Correlation Votes: " + votes.correlation_votes));
    $("#causation-div").append($("<p>").text("Causation Votes: " + votes.causation_votes));
    $("#next-button").show();
  });
});

// The API object contains methods for each kind of request we'll make
var API = {
  saveExample: function (example) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/examples",
      data: JSON.stringify(example)
    });
  },


  getChartData: function () {
    return $.ajax({
      url: "api/chartdata",
      type: "GET"
    });
  },
  getExamples: function () {
    return $.ajax({
      url: "api/examples",
      type: "GET"
    });
  },
  deleteExample: function (id) {
    return $.ajax({
      url: "api/examples/" + id,
      type: "DELETE"
    });
  }
};

// loadChartData (analog to refreshExamples function below)
var loadChartData = function () {
  API.getChartData().then(function (data) {
    var $chartData = data.map(function (chartdata) {
      var $a
    })
  });

}

// refreshExamples gets new examples from the db and repopulates the list
var refreshExamples = function () {
  API.getExamples().then(function (data) {
    var $examples = data.map(function (example) {
      var $a = $("<a>")
        .text(example.text)
        .attr("href", "/example/" + example.id);

      var $li = $("<li>")
        .attr({
          class: "list-group-item",
          "data-id": example.id
        })
        .append($a);

      var $button = $("<button>")
        .addClass("btn btn-danger float-right delete")
        .text("ｘ");

      $li.append($button);

      return $li;
    });

    $exampleList.empty();
    $exampleList.append($examples);
  });
};

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function (event) {
  event.preventDefault();

  var example = {
    text: $exampleText.val().trim(),
    description: $exampleDescription.val().trim()
  };

  if (!(example.text && example.description)) {
    alert("You must enter an example text and description!");
    return;
  }

  API.saveExample(example).then(function () {
    refreshExamples();
  });

  $exampleText.val("");
  $exampleDescription.val("");
};

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
var handleDeleteBtnClick = function () {
  var idToDelete = $(this)
    .parent()
    .attr("data-id");

  API.deleteExample(idToDelete).then(function () {
    refreshExamples();
  });
};

function showChart(chartCounter) {
    // window.onload = function () {
        $.get("/api/chartdata/" + chartCounter, (data) => {
            console.log(data, "data", "chartCounter: ", chartCounter)
            // var ctx = document.getElementById('myChart');
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
            // console.log(document.getElementById("myChart"))
            window.myLine = Chart.Line(ctx, {
                data: lineChartData,
                options: {
                    responsive: true,
                    hoverMode: 'index',
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Causation or Correlation'
                    },
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
                    }
                }
            });
        }).then(() =>{
            $("#next-button").hide();
            $("#chart-container").show();
            $("#button-container").show();
        })
    // };
}