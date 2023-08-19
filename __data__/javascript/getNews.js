class News{
    // this function will be called by your obsidian note's dataviewjs codeblock
    async listNews(element, articleCount) {

        // this function will be called by fetchNews function to format the json data into presentable table
        // this function takes count(row number), time of the article, title, and Read More url hyperlink
        const formatArticle = (count, time, title, url) => {
            // ${} is a string template and it will replace the variable name with actual value of the variable. Overall cleaner than concat with + sign
            return `
                    <tr>
                        <td style="text-align:right">${count}</td>
                        <td>${time}</td>
                        <td>${title}</td>
                        <td><a href="${url}" target="_blank"><span display="flex" class="font-semibold text-sm pl-4 --text-accent --link-external-color external-link">Read</span></a></td>
                    </tr>`
        }

	// this is the function that fetch data from public API
        const fetchNews = async () => {
            // Get news ids array
            const responseRaw = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
            // Parse to json object so we can use
            const responseJson = await responseRaw.json()
            // Only get a few news, depends on articleCount (15)
            const newsIds = responseJson.slice(0,articleCount)

            // Map ids into fetch async requests
            const newsPromises = newsIds.map(newsId => fetch(`https://hacker-news.firebaseio.com/v0/item/${newsId}.json`))
            // Fetch individual news with Promise.all. This will resolve everything within the array, rather than doing it in a loop
            const newsResRaw = await Promise.all(newsPromises)

            // Map results into json parser functions
            let newsJson = newsResRaw.map(item => item.json())
            // Parse to json object news with Promise.all. This will resolve everything within the array, rather than doing it in a loop
            let news = await Promise.all(newsJson)

            // Create a table and first header row
            let html = '<table><tr><td style="text-align:right">#</td><td>Time</td><td>Title</td><td>Read More</td>'

            // Loop through the articles and convert time into local time
            news.forEach((newsObj, index) => {
                const dateStr = new Date(newsObj.time*1000).toLocaleDateString('en-us',{month:"2-digit", day:"2-digit", year:"numeric"})
                const timeStr = new Date(newsObj.time*1000).toLocaleTimeString('en-ZA')
                // Pass into formatArticle defined above to get the proper HTML back, and add that to the final result html variable
                html += formatArticle((index+1), `${dateStr} ${timeStr}` , newsObj.title, newsObj.url)
            })
            // Close the table element
            html += "</table>"

            // Assign the final result html back to element you passed from notes
            element.innerHTML = html
        }

        // Invoke fetchNews function whenever listNews function is called
        await fetchNews()
    }
}