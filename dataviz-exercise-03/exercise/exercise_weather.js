
/*
	Run the action when we are sure the DOM has been loaded
	https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded
	Example:
	whenDocumentLoaded(() => {
		console.log('loaded!');
		document.getElementById('some-element');
	});
*/
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

const TEST_TEMPERATURES = [13, 18, 21, 19, 26, 25,16];


// Part 1 - DOM

whenDocumentLoaded(() => {
	// Part 1.1: Find the button + on click event
	const button = document.getElementById("btn-part1");
	function sayButtonClicked () {
		console.log("The button was clicked")
	};
	button.onclick =  sayButtonClicked;
	// Part 1.2: Write temperatures
	function showTemperatures(container_element, temperature_array) {
		container_element.innerHTML = ""
		function createParagraphs (temperature_value) {
			const newPar = document.createElement("p");
			if (temperature_value >= 23) {
				newPar.classList.add("warm");
			} else if (temperature_value <= 17) {
				newPar.classList.add("cold");
			}
			const newContent = document.createTextNode(temperature_value.toString());
			newPar.appendChild(newContent);
			container_element.appendChild(newPar)
		};
		temperature_array.map(createParagraphs)
	};
	const currentDiv = document.getElementById("weather-part1");
	showTemperatures(currentDiv, TEST_TEMPERATURES);
});

// Part 2 - class

class Forecast {
	constructor(container) {
		this.container = container;
		this.temperatures = [1,2,3,4,5,6,7];
	}

	toString () {
		return this.container.innerHTML + this.temperatures.toString()
	};

	print () {
		console.log(this.toString())
	}

    show() {
        this.container.innerHTML = "";
        const createParagraphs = (temperature_value) => {
            const newPar = document.createElement("p");
            if (temperature_value >= 23) {
                newPar.classList.add("warm");
            } else if (temperature_value <= 17) {
                newPar.classList.add("cold");
            }
            const newContent = document.createTextNode(temperature_value.toString());
            newPar.appendChild(newContent);
            this.container.appendChild(newPar);
        };
        this.temperatures.forEach(createParagraphs);
    }

	reload () {
		this.temperatures = TEST_TEMPERATURES
		this.show()
	}
}

whenDocumentLoaded(() => {
	forecastInstance = new Forecast(document.getElementById("weather-part2"));
	forecastInstance.show();
	const button = document.getElementById("btn-part1");
	button.onclick = () => {forecastInstance.reload()} 
	// button.onclick = forecastInstance.reload.bind(forecastInstance);
});



// Part 3 - fetch

const QUERY_LAUSANNE = 'http://api.weatherbit.io/v2.0/forecast/daily?city=Lausanne&days=7&key=01b49804fe0a46fd8a8c7258151f1301';
function weatherbitToTemperatures(data) {
	console.log(data.data)
	const temperatures = data.data.map(day => {
		// Calculate mean of low and high temperatures
		const meanTemperature = (day.app_max_temp + day.app_min_temp) / 2;
		return meanTemperature;
	});
	return temperatures;
}

class ForecastOnline extends Forecast {
	async reload () {
		const tempData = await logTemp();
		this.temperatures = weatherbitToTemperatures(tempData)
		this.show()
	}
}

async function logTemp(city="Lausanne") {
	const response = await fetch(`http://api.weatherbit.io/v2.0/forecast/daily?city=${city}&days=7&key=01b49804fe0a46fd8a8c7258151f1301`);
	const temp = await response.json();
	console.log(temp);
	return temp
}

LAUSANNE_TEMP = logTemp()

whenDocumentLoaded(() => {
	forecastOnlineInstance = new ForecastOnline(document.getElementById("weather-part3"))
	forecastOnlineInstance.reload()
});

// Part 4 - interactive

class ForecastOnlineCity extends ForecastOnline {
	setCity (city) {
		this.city = city
	}

	async reload () {
		const tempData = await logTemp(this.city);
		this.temperatures = weatherbitToTemperatures(tempData)
		this.show()
	}

	show () {
		super.show()
		const city_name = document.createElement("p")
		city_name.textContent = this.city
		this.container.insertBefore(city_name, this.container.firstChild)
	}
}

whenDocumentLoaded(() => {
	forecastOnlineCityInstance = new ForecastOnlineCity(document.getElementById("weather-city"))
	const buttoncity = document.getElementById("btn-city");
	function setCityNameFromButton () {
		console.log("Clicking city button")
		forecastOnlineCityInstance.setCity(document.getElementById("query-city").value)
		forecastOnlineCityInstance.reload()
	};
	buttoncity.onclick = setCityNameFromButton;
	
});