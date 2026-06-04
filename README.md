# UdK_SommerSemester2026
MA Infoklasse. 


**2 Step:**
Divide the map into regions based on the geographical location eg. North and South America. And from there group the countries that have similar political evolution, with the goal of showing the political _stakeholders_ or level of influence. This second part could be done with R. 

**22.05:** We are working with the ert.csv dataset found on the data folder. From there we filtered with the help of R and create a new dataset 'all_continents' showing the country (string), the continent (string), year(numeric) and the polyarchy (integrer). This last value is the measure of the % of democracy, where 0 means Closed Autocracy and 1 Liberal Democracy. 
We ploted the results with JS, creating a chloropleth map and a multiple series line chart. 
For the shape of the countries we have decided to use the current state of the internation borders, and use the parameter of the color to show the regime changes. Due to the changing nature of the countries, we used a pattern of diagonal lines for those nations which we dont have data, e.g. West Sahara or Greenland.

We want to make a chloropleth map that represents the value of v2x_polyarchy. 
1- Using gradient. 0,B-1,W, 
2- Plotting over a period of time 1900-2025
3- Animated? JS+HTML // Datawrapper 
4- Search for a political EU map
5- Create a common GitHub directory.
Until 12:00

Show the global wave and after that a regional heatmap from a special region. 

6- Fill the CSV with missing data, to Write NA and then code that with a accent color/Patterns. To mark the non existence of the nation

A- After the HTML, creating a tool that selects the object and shows the individual politic development of the nation. 
B- A window shows the graph and the individual development

!- The graph can have a over that on the peaks of the waves shows the schocks of wikipedia. 
”-The change of countries over

04.06 
Filter the timeline on continents or regions. 

Julias Kurs: Based on stock markets, animate the evolution of the v2x_polyarchy on a mirrored x axis where upwards the democratizing countries and downwards the autocratizing. on the back a values grid where the countires name appear and are pusshed either up or down. 
The aesthetic would a inverted to avoid the good/bad connotations. 
3d viewport of the world countries
