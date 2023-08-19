class WeatherGov{
    // this function will be called by your obsidian note's dataviewjs codeblock
    async getWeather(element) {

        // this function will be called by fetchWeather function to format the json data into presentable table
        // this function takes items(hourly and forecast of the week), and hourly boolean to distinguish between hourly and weekly forecast
        const formatWeather = (items, hourly) => {
	    // this temp is a string variable holding strings, this temp is temproary, not temperature
            let temp = ""
	    // this tempObj is an object variable holding temperature related data, this tempObj is temperature, not temproary
            let tempObj = {}

	    // loop through the result array
            items.forEach((item, index)=>{
		// This is for weekly forcast, we will be constructing tempObj into Day/Night
                if(!hourly){
		    // json from API have isDaytime boolean helping us determine what time of the day this temperature is for
                    if(item.isDaytime){
                        tempObj.day = {}
                        tempObj.day.temp = item.temperature
                        tempObj.day.humidity = item.relativeHumidity.value
                        tempObj.day.windDirection = item.windDirection
                    } else {
                        tempObj.night = {}
                        tempObj.night.temp = item.temperature
                        tempObj.night.humidity = item.relativeHumidity.value
                        tempObj.night.windDirection = item.windDirection
                    }
                }

		// Skipping every other result, 
		    // for hourly forecast, this will display every other hour (to make the table short)
		    // for weekly forecast, this will display day/night in one row
                if(index%2==1){
                    let startTime = ""
                    let temperature = ""
                    let humidity = ""
                    let windDirection = ""
		    
		    // format hourly and weekly differently
                    if(hourly){
                        startTime = `<td>${new Date(item.startTime).toLocaleTimeString('en-US', { hour12: false })}</td>`
                        temperature = `<td>${item.temperature}</td>`
                        humidity = `<td>${item.relativeHumidity.value}</td>`
                        windDirection = `<td>${item.windDirection}</td>`
                    } else {
                        startTime = `<td style='text-align:left'>${item.name.split(" ")[0]}</td>`
                        temperature = `<td>${tempObj.day.temp} / ${tempObj.night.temp}</td>`
                        humidity = `<td>${tempObj.day.humidity} / ${tempObj.night.humidity}</td>`
                        windDirection = `<td>${tempObj.day.windDirection} / ${tempObj.night.windDirection}</td>`
                    }

		    // Concat the result into temp string variable
                    temp += `<tr>
                            ${startTime}
                            ${temperature}
                            <td>${item.windSpeed}</td>
                            ${windDirection}
                            ${humidity}`

		    // Only hourly have precipitation value, so add it last
                    if(hourly){
                        temp += `<td>${item.probabilityOfPrecipitation.value}</td>` 
                    }
                    temp += `</tr>`
                }
            })

	    // Replacing ${} with variable value and return back the formatted HTML code to caller
            return `
                <div class="mt-2">
                    <div class='block p-1 --tag-border-color --tag-border-width rounded'>
                        <div class="flex border border-transparent pl-1">
                            <div>
                                <div class="text-m font-bold --text-bold pl-4"><b>${hourly?"Los Angeles Weather At The Moment":"Los Angeles Weather Forecast (Day/Night)"}</b>
                                </div>
                                <table style="display:flex; align-items:center; justify-content:center; font-size:0.${hourly?"7":"8"}em">
                                <tr>
                                    <th style="font-size:1em">Time</th>
                                    <th style="font-size:1em">Temp</th>
                                    <th style="font-size:1em">Wind Speed</th>
                                    <th style="font-size:1em">Direction</th>
                                    <th style="font-size:1em">Humidity</th>
                                    ${hourly? "<th style='font-size:1em'>Precipitation</th>":""}
                                </tr>
                                ${temp}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>`
        }

	// this is the function that fetch data from public API
        const fetchWeather = async () => {
	    // Get forecast grid station, replace with your lat, long
            const gridResponse = await fetch(`https://api.weather.gov/points/34.0522,-118.2437`) 
	    // Parse to json object so we can use
            const gridJson = await gridResponse.json()

	    // The grid will give us 2 forecast we can use, the hourly forecast starting from now, and weekly forecast
            const forecastUrl = gridJson.properties.forecast
            const forecastHourlyUrl = gridJson.properties.forecastHourly

	    // Get actual weather data for both weekly and hourly
            const forecastResponse = await fetch(forecastUrl) 
            const forecastHourlyResponse = await fetch(forecastHourlyUrl) 
	
	    // Parse to json object so we can use
            let forecastJson = await forecastResponse.json()
            let forecastHourlyJson = await forecastHourlyResponse.json()

	    // Only get 10 of the hourly data, (will only take every other hour so eventually reduce to 5)
            forecastHourlyJson = forecastHourlyJson.properties.periods.slice(0,10)
	    // Format a little bit
            forecastHourlyJson.forEach(item=>{
                item.temperature = Math.round((item.temperature-32)/1.8) + "&degC"
                item.relativeHumidity.value = item.relativeHumidity.value+"%"
                item.probabilityOfPrecipitation.value = item.probabilityOfPrecipitation.value+"%"
            })
	    // Pass into function and assign back to element variable from notes
            element.innerHTML += formatWeather(forecastHourlyJson, true)
            
	    
	    // Only get 10 of the hourly data, (will only take every other hour so eventually reduce to 5)
            forecastJson = forecastJson.properties.periods
	    // Format a little bit
            forecastJson.forEach(item=>{
                item.temperature = Math.round((item.temperature-32)/1.8) + "&degC"
                item.relativeHumidity.value = item.relativeHumidity.value+"%"
            })
	    // Pass into function and assign back to element variable from notes
            element.innerHTML += formatWeather(forecastJson, false)
        }
        // Invoke fetchWeather function whenever getWeather function is called
        await fetchWeather()
    }
}
