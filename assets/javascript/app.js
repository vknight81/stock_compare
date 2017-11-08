var firstArr = [];
var secondArr = [];
var nameOne = ' ';
var nameTwo = ' ';


var makeQueryURLOne = function(stockObjectOne) {

	var startDate = stockObjectOne.startDateSelected;
	var endDate = stockObjectOne.endDateSelected;
	var exchangeOne = stockObjectOne.exchange;
	var tickerSymbolOne = stockObjectOne.tickerOne;
	var queryURLOne = "https://www.quandl.com/api/v3/datasets/WIKI/" + exchangeOne + "_"+ tickerSymbolOne + ".json?" + "column_index=1&start_date=" + startDate + "&end_date=" + endDate + "&api_key=MKPLtd_UFJCiG85QgaPv";
	return queryURLOne; 

}

var makeQueryURLTwo = function(stockObjectTwo) {
	var startDate = stockObjectTwo.startDateSelected;
	var endDate = stockObjectTwo.endDateSelected;
	var tickerSymbolTwo = stockObjectTwo.tickerTwo;
	var exchangeTwo = stockObjectTwo.exchange;
	var queryURLTwo = "https://www.quandl.com/api/v3/datasets/WIKI/"+ exchangeTwo + "_" + tickerSymbolTwo + ".json?" + "column_index=1&start_date=" + startDate + "&end_date=" + endDate + "&api_key=MKPLtd_UFJCiG85QgaPv";

	return queryURLTwo;
}

var startSender = function(arr) { // function that grabs the last item in an array and returns it.
	var startDate = arr[arr.length - 1];
	return startDate;
}

var endSender = function(arr) { //  function that grabs the first item in an array an returns it. 
	var endDate = arr[0];
	return endDate;
}

function createChart(stock, column) {
	var chartStart = new Date(stock.startDate[0]);
	var chartEnd = new Date(stock.endDate[0]);
	console.log(chartStart, chartEnd);
	stock.dateArray.forEach(function(value, index){
		if (column === 'left') {
			firstArr[index] = {x: new Date(value[0]), y: value[1]};
			nameOne = stock.name;
		} else {
			secondArr[index] = {x: new Date(value[0]), y: value[1]};
			nameTwo = stock.name;
		}
	});
	var chart = new CanvasJS.Chart("chartContainer", {
		title: {
			text: 'Stock values over time',
		},
		animationEnabled: true,
		axisX: {
			gridColor: "Silver",
			tickColor: "silver",
			valueFormatString: "MM/DD/YYYY",
			minimum: chartStart,
      maximum: chartEnd
		},
		toolTip: {
			shared: true,
			content: "{name} <br> {x}: ${y}"  
		},
		theme: "theme1",
		axisY: {
			gridColor: "Silver",
			tickColor: "silver",
			prefix: "$" 
		},
		legend: {
			verticalAlign: "center",
			horizontalAlign: "right"
		},
		data: [
		{
			type: "line",
			showInLegend: true,
			lineThickness: 1,
			name: nameOne,
			markerType: "none",
			color: "#F08080",
			dataPoints: firstArr
		},
		{
			type: "line",
			showInLegend: true,
			name: nameTwo,
			markerType: 'none',
			color: "#20B2AA",
			lineThickness: 1,
			dataPoints: secondArr
		}
		],
		legend: {
			cursor: "pointer",
			itemclick: function (e) {
				if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
					e.dataSeries.visible = false;
				}
				else {
					e.dataSeries.visible = true;
				}
				chart.render();
			}
		}
	});

	chart.render();
}

var displayStockOne = function(stockObjectOne) {
	$.ajax({
		url: makeQueryURLOne(stockObjectOne),
		method: "GET"
	}).done(function(response){
		var stockResultOne= {} // creates an object that will give FE the name, ticker symbol, exchange, date array, start date, end date
		var data = response.dataset;
		stockResultOne.name = stockObjectOne.stockName; // uses dot notation to create the object.
		stockResultOne.ticker = stockObjectOne.tickerOne;
		stockResultOne.exchange = stockObjectOne.exchange;
		stockResultOne.dateArray = data.data;
		stockResultOne.startDate = startSender(data.data);
		stockResultOne.endDate = endSender(data.data);
		displayResult(stockResultOne, "left");
	}).fail(function(error){
		swal({
		 	title: "Hmmm",
		 	text: "It looks like that stock index isn't available",
		 	type: "error",
		 	confirmButtonText: "Okay"
		});
		$('#left-stock-ticker').html('----');
		$('#left-stock-exchange').html('----')
	});
}


var displayStockTwo = function(stockObjectTwo) {
	$.ajax({
		url: makeQueryURLTwo(stockObjectTwo),
		method: "GET"
	}).done(function(response){
		var stockResultTwo= {} // creates an object that will give FE the name, date array, starte date, end date
		var data = response.dataset;
		stockResultTwo.name = stockObjectTwo.stockName //users dot notation to create the object.
		stockResultTwo.ticker = stockObjectTwo.tickerTwo;
		stockResultTwo.exchange = stockObjectTwo.exchange;
		stockResultTwo.dateArray = data.data;
		stockResultTwo.startDate = startSender(data.data);
		stockResultTwo.endDate = endSender(data.data);
		displayResult(stockResultTwo, "right");
	}).fail(function(error){
		swal({
		 	title: "Hmmm",
		 	text: "It looks like that stock index isn't available",
		 	type: "error",
		 	confirmButtonText: "Okay"
		});
		$('#right-stock-ticker').html('----');
		$('#right-stock-exchange').html('----')
		
	});
}

// Called at .done of Quandl API AJAX request
// Display the stock object in the specified column
function displayResult(stockObject, column) {
	var panelTicker = $('#' + column + '-stock-ticker');
	var panelExchange = $('#' + column + '-stock-exchange');
	var panelValues = $('#' + column + '-stock-values');
	var ticker = stockObject.ticker;
	var exchange = stockObject.exchange;
	var valueArray = stockObject.dateArray;

	createChart(stockObject, column);
	
	panelTicker.html(ticker);
	panelExchange.html(exchange);

}


