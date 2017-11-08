$( document ).ready(function(){


	var config = {
		apiKey: "AIzaSyA1ot93Xhw0Iemmof8EeVvGFcDCFaNf4bs",
		authDomain: "stock-compare.firebaseapp.com",
		databaseURL: "https://stock-compare.firebaseio.com",
		storageBucket: "stock-compare.appspot.com",
		messagingSenderId: "384877267053"
	};

	firebase.initializeApp(config);
	var database = firebase.database();

	// Declare variables
	var leftWaitingInterval;
	var rightWaitingInterval;
	var ajaxInterval;
	var ajaxRequests = [];
	var counter = 0;
	var lIndex = -1;
	var arr = [];
	var field;
	var name;
	var symbol;
	var exchange;
	var tickerOne;
	var tickerTwo;
	var stockNameOne; 
	var stockNameTwo;
	var stockObjectOne = {};
	var stockObjectTwo = {};
	var today = new Date;
	var date = today.toISOString().split('T')[0];

	var submitStockOne = function(){  
		var startDateSelectedOne = $("#start-date").val().trim(); 
		var endDateSelectedOne = $("#end-date").val().trim(); 
		
		if (validateDateStrings(startDateSelectedOne, endDateSelectedOne)) {

			stockObjectOne = { // saves all of those into an object
				stockName: stockNameOne,
				tickerOne: tickerOne,
				exchange: exchange,
				startDateSelected: startDateSelectedOne,
				endDateSelected: endDateSelectedOne
			}

		  	database.ref().push(stockObjectOne).then(function(snapshot){
				localStorage.setItem("user_key_one", snapshot.key); // saves that data in the database.
			});
			stockObjectTwo.startDateSelected = startDateSelectedOne;
			stockObjectTwo.endDateSelected = endDateSelectedOne;
			displayStockOne(stockObjectOne);
			displayStockTwo(stockObjectTwo);
		} 
	}

	var submitStockTwo = function(){
		var startDateSelectedOne = $("#start-date").val().trim(); 
		var endDateSelectedOne = $("#end-date").val().trim(); 
		
		if (validateDateStrings(startDateSelectedOne, endDateSelectedOne)) {
			stockObjectTwo = {
				stockName: stockNameTwo,
				tickerTwo: tickerTwo,
				exchange: exchange,
				startDateSelected: startDateSelectedOne,
				endDateSelected: endDateSelectedOne
			}
			database.ref().push(stockObjectTwo).then(function(snapshot){
				localStorage.setItem("user_key_two", snapshot.key);
			});
			
			stockObjectOne.startDateSelected = startDateSelectedOne;
			stockObjectOne.endDateSelected = endDateSelectedOne;
			displayStockTwo(stockObjectTwo);
			displayStockOne(stockObjectOne);
		}
	};

	function resetForm(column) {
		setTimeout(function(){
			// Stop the waiting animation interval
			clearInterval(leftWaitingInterval);
			clearInterval(rightWaitingInterval);
			// Reset the text of the search button
			$('#' + column + '-button').val('search');
			// Clear the typeahead results
			$('#' + column + '-type-result').html('');
		}, 20)
		
	}


	function validateDateStrings(startDate, endDate) {
		var startDate = Date.parse(startDate);
		var endDate = Date.parse(endDate);
		if (startDate > endDate) {
			swal({
				  title: "Uh oh!",
				  text: "Make sure that your start date is not beyond the end date!",
				  type: "error",
				  confirmButtonText: "Cool"
				});
			return false;
		} else if (startDate > today || endDate > today) {
			swal({
				  title: "C'mon!",
				  text: "Predict the future too? That's flattering, but try again!",
				  type: "error",
				  confirmButtonText: "Cool"
				});
			return false;
		} else {
			return true;
		}
	}

	// Create a new click handler for the dropdown typeahead results
	function setResultClickHandler() {
		// On reult click, do this
		$('.' + column + '-result-li').mousedown(function(){
			// Get stock company name from the data-name attribute of the result clicked and populate the search field with it
			field.val($(this).data('name'));
			// Set the #left-search data-symbol attribute as the result's data-symbol attribute
			exchange = $(this).data('exchange');
			if (column === 'left') {
				tickerOne = $(this).data('symbol');
				stockNameOne = $(this).data('name');
				// Submit the form
				$('#left-input-form').submit();
			} else {
				tickerTwo = $(this).data('symbol');
				stockNameTwo = $(this).data('name');
				// Submit the form
				$('#right-input-form').submit();
			}
			
		})
	}

	// Type-ahead functionality (ajax success callback function)
	function typeAhead(response) {
		// save the response in the parent scope
		arr = response;
		// Reset result list index to -1 (nothing selected)
		lIndex = -1;
		// Stop the waiting animation 
		clearInterval(leftWaitingInterval);
		clearInterval(rightWaitingInterval);
		// Reset the text in search button
		$('#' + column + '-button').val('search');
		// Clear previous typeahead results
		$('#' + column + '-type-result').html('');
		// If there is something in the response array
		if (arr !== null) {
			// For each result in response array
			arr.forEach(function(value, index) {
				// If not in the Bats exchange
				if (value.Exchange[0] !== 'B') {
					// Truncate the displayed name if it is longer than 21 character
					if (value.Name.length < 22) {
						name = value.Name;
					} else {
						name = value.Name.slice(0, 20) + '...';
					}
					
					exchange = value.Exchange;
					
					// Truncate the displayed symbol if it is longer than 5 characters
					if (value.Symbol.length < 6) {
						symbol = value.Symbol;
					} else {
						symbol = value.Symbol.slice(0, 4) + '...';
					}
					// Add it to the result dropdown list
					$('#' + column + '-type-result').append('<li class="' + column + '-result-li row" data-name="' + value.Name + '" data-symbol="' + value.Symbol + '" data-exchange="' + value.Exchange + '"><span class="full-name">' + name + '</span><span class="exchange">'  + exchange + ': <span class="ticker">' + symbol + '</span></span></li>');
				}
			})
			
			// Set a click handler for the results
			setResultClickHandler();
		}
	}

	// Handle errors from the ajax request
	function handleError(error) {
		console.log('error', error);
		clearInterval(leftWaitingInterval);
		clearInterval(rightWaitingInterval);
	}

	// Highlight the result list item at a given index
	function highlightFromList(index) {
		$('.' + column + '-result-li').css({ 'background':'#fff' });
		$('.' + column + '-result-li').eq(index).css({ 'background': '#eee'});
	}

	function submitAtIndex(index, column) {
		var stockListItem = $('.' + column + '-result-li').eq(index);
		field.val(stockListItem.data('name'));
		if (column === 'left') {
			tickerOne = stockListItem.data('symbol');
			stockNameOne = stockListItem.data('name');
			exchange = stockListItem.data('exchange');
			// Submit the form
			$('#left-input-form').submit();
		} else {
			tickerTwo = stockListItem.data('symbol');
			stockNameTwo = stockListItem.data('name');
			exchange = stockListItem.data('exchange');
			$('#right-input-form').submit();
		}
	}

	function animate(column) {
		animateSpan = $('#' + column + '-animation');
		animateSpan.animate({'opacity': 0.5}, 10, function(){
			animateSpan.animate({'opacity': 0.0}, 550);
		});

	}

	function animateLeftWaiting() {
		// Stop the animation before adding a new interval (otherwise the animation would be running twice)
			clearInterval(leftWaitingInterval);
			// Run a waiting/loading animation
			leftWaitingInterval = setInterval(function() {
				animate('left');
			}, 560);
	}

	function animateRightWaiting() {
		// Stop the animation before adding a new interval (otherwise the animation would be running twice)
			clearInterval(rightWaitingInterval);
			// Run a waiting/loading animation
			rightWaitingInterval = setInterval(function(){
				animate('right')
			}, 560);
	}

	// Save jQuery search field object in 'field'
	fieldClass = $('.search');

	// On search field blur, do this
	fieldClass.blur(function() {
		if ($(this).val().length < 1) {
			createChart({
				name: ' ',
				dateArray: [],
			}, $(this).data('column'));
		}

		// Remove event handlers
		$('#left-search').off('keydown');
		$('#left-search').off('keyup');
		$('#right-search').off('keydown');
		$('#right-search').off('keyup');
		// Stop displaying the results
		$('#' + column + '-type-result').html('');
		// Reset list index;
		lIndex = -1;
	});

	fieldClass.focusin(function() {
		// Get which column was focused
		column = $(this).data('column');
		field = $('#' + column + '-search');
		// If there is something in it
		if (field.val().length > 0) {
			if (column === 'left') {
				// Run search animation in that column
				animateLeftWaiting();
			} else {
				animateRightWaiting();
			}

			// Save the user input to the search variable
			var search = field.val();
			// If the search is not empty 
			if (search.length > 0) {
				// Request stock info from MarkitOnDemand API
				ajaxInterval = setTimeout(function(){
					var url = 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp';
					ajaxRequests[counter] = $.ajax({
						data: { 'input': search },
						url: url,
						dataType: 'jsonp',
						success: typeAhead,
						error: handleError,
						context: this
					})
				}, 700);
			}
		}

		// When a user types in the search field (key down), do this
		field.on('keydown', function(event) {
			// If the key is not an up or down arrow key
			if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && event.key !== 'Enter') {
				// Don't run the previously initiated ajax request
				clearInterval(ajaxInterval);
			// If the key is an up or down arrow key
			} else {
				// Prevent default arrow key behavior (moving the cursor)
				event.preventDefault();
				// If up key pressed and the Index to highlight is within range
				if (event.key === 'ArrowUp' && lIndex > 0) {
					lIndex--;
				// If down key pressed and the Index to highlight is within range
				} else if (event.key === 'ArrowDown' && lIndex < arr.length) {
					lIndex++;
				} else if (event.key === 'Enter') {
					if (lIndex >= 0) {
						submitAtIndex(lIndex, column);
					} else {
						submitAtIndex(0, column);
					}
				}
				// Highlight the item in the list at the selected index
				highlightFromList(lIndex, column);
			}
		});

		// When the user types in the search field (key up), do this
		field.on('keyup', function(event) {
			// If the key is a letter or number
			if (event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode >= 65 && event.keyCode <= 90 || event.keyCode >= 96 && event.keyCode <= 105 || event.key === "Backspace") {
				// Add to the ajax request counter
				counter++;
				// Abort any pending ajax request
				if (ajaxRequests[counter - 1] !== undefined) {
					ajaxRequests[counter - 1].abort();
				}

				if (column === 'left') {
					animateLeftWaiting();
				} else {
					animateRightWaiting();
				}

				// Save the user input to the search variable
				var search = field.val();
				// If the search is not empty 
				if (search.length > 0) {
					// Run the request stock info from MarkitOnDemand API
					ajaxInterval = setTimeout(function(){
						var url = 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp';
						ajaxRequests[counter] = $.ajax({
							data: { 'input': search },
							url: url,
							dataType: 'jsonp',
							success: typeAhead,
							error: handleError,
							context: this
						})
					}, 700);
				// If the search is empty (if the user deleted their search term), do this
				} else {
					// Stop the animation
					clearInterval(leftWaitingInterval);
					clearInterval(rightWaitingInterval);
					// Stop any ajax requests that have not yet been sent
					clearInterval(ajaxInterval);
					// Stop any ajax requets that have already been sent
					if (ajaxRequests[counter] !== undefined) {
						ajaxRequests[counter].abort();
					}
					// Reset the button value
					$('#' + column + '-button').val('search');
					// Clear the results list
					$('#' + column + '-type-result').html('');
				}
			}
		});
	});

	// On left orm submit, do this
	$('#left-input-form').submit(function(event) {
		// Prevent default submit behavior
		event.preventDefault();
		// Submit the left form
		resetForm('left');
		submitStockOne();
	});

	$('#right-input-form').submit(function(event) {
		// Prevent default submit behavior
		event.preventDefault();
		// Submit the right form
		resetForm('right');
		submitStockTwo();
	});

	//left side default data
	var submitDefaultOne = function(){
		var stockNameOne = "Boeing Co";
		var tickerOne = "BA";

		stockObjectOne = { 
			stockName: stockNameOne,
			tickerOne: tickerOne,
			exchange: 'NYSE',
			startDateSelected: '2016-02-20',
			endDateSelected: date
		}
		$('#left-search').val(stockObjectOne.stockName);
		$('#start-date').val(stockObjectOne.startDateSelected);
		$('#end-date').val(stockObjectOne.endDateSelected);
		displayStockOne(stockObjectOne);
	};



	//right side default data
	var submitDefaultTwo = function(){
		var stockNameTwo = "3M Company" ;
		var tickerTwo = "MMM";

		stockObjectTwo = { 
			stockName: stockNameTwo,
			tickerTwo: tickerTwo,
			exchange: 'NYSE',
			startDateSelected: '2016-02-20',
			endDateSelected: date
		}
		$('#right-search').val(stockObjectTwo.stockName);
		$('#start-date').val(stockObjectTwo.startDateSelected);
		$('#end-date').val(stockObjectTwo.endDateSelected);
		displayStockTwo(stockObjectTwo);
	};

	if(localStorage.getItem("user_key_one") === null){
		submitDefaultOne(); //grab default data if there is no local key
	} else {
		var key = localStorage.getItem("user_key_one");
		database.ref(key).on("value", function(snapshot){
			stockObjectOne = {
				endDateSelected: snapshot.val().endDateSelected,
				startDateSelected: snapshot.val().startDateSelected,
				exchange: snapshot.val().exchange,
				stockName: snapshot.val().stockName,
				tickerOne: snapshot.val().tickerOne
			}
			$('#left-search').val(stockObjectOne.stockName);
			$('#start-date').val(stockObjectOne.startDateSelected);
			$('#end-date').val(stockObjectOne.endDateSelected);
			displayStockOne(stockObjectOne);
		});
	}

	if(localStorage.getItem("user_key_two") === null){
		submitDefaultTwo(); //grab default data if there is no local key
	} else {
		var key = localStorage.getItem("user_key_two");
		database.ref(key).on("value", function(snapshot){
			stockObjectTwo = {
				endDateSelected: snapshot.val().endDateSelected,
				startDateSelected: snapshot.val().startDateSelected,
				exchange: snapshot.val().exchange,
				stockName: snapshot.val().stockName,
				tickerTwo: snapshot.val().tickerTwo
			}
			$('#right-search').val(stockObjectTwo.stockName);
			$('#start-date').val(stockObjectTwo.startDateSelected);
			$('#end-date').val(stockObjectTwo.endDateSelected);

			stockObjectTwo.startDateSelected = stockObjectOne.startDateSelected;
			stockObjectOne.endDateSelected = stockObjectTwo.endDateSelected;
			displayStockTwo(stockObjectTwo);
			displayStockOne(stockObjectOne);
		});
	}
});