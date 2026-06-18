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

**04.06** 
Filter the timeline on continents or regions. 

Julias Kurs: Based on stock markets, animate the evolution of the v2x_polyarchy on a mirrored x axis where upwards the democratizing countries and downwards the autocratizing. on the back a values grid where the countires name appear and are pusshed either up or down. 
The aesthetic would a inverted to avoid the good/bad connotations. 
3d viewport of the world countries
We decided to instead doing a project for this course to get into the data and how the projects are made to understand the code. 

**Until 17.06** 
We wokred on the tree rings diagram, based on v2x_Polyarchy we created one ring per year, growing to outside the higher it gets the thinner and more roughner the stroke gets. We plotted every year, two years lapse and three years lapse. printed them and chosse the three years gap version to draw by hand in 40x40cm. 

**17.06**
Meeting with ViSoP and Vanessa and Dnaiel. They explained us the values of the ERT dataset. 
  ·v2x_regime, integer [0.3]
    0- Closed Autocracy. 
    1- Electoral Autocracy.
    2- Electoral Democracy
    3- Liberal Democracy.
    
  ·v2x_polyarchy, interval [0,1]
    value of the politic regime, 0 Closed Autocracy and 3 Liberal Democracy.
    
--- Democratization episodes ----    
  ·dem_ep, dummy [0,1]
    Identifier of a democratization episode, 
    0- No. 
    1- Episode. 

  ·dem_ep_prch, dummy [0,1] Episode with a Potencial Democratic Transition // Liberatization Aut -> Dem
    Identifies if the described episode has the potencial for a democratic transition. 
    0- No. 
    1- eEpisode with a potencial transition from Autocracy to Democracy.

  ·dem_ep_outcome, categorial [0,6] Democratization outcome. 
    0- No democratization episode during the year.
    1- Democratic Transition. Episode resulted in a transition from Aut -> Dem. Followed by democratic elections.
    2- Preempted Democratic Transition. Ep resulted Aut -> Dem but the democratic unit did NOT hold elections before reverting to autocracy.
    3- Stabilized Democratic Autocracy. Ep not resulted into a change from Aut -> Dem, and thepolitical unit stabilized as electoral autocracy. 
    4- Reverted Liberatization. A) Ep stayed in closed autocrazy. B) Ep changed to electoral autocrazy but went back to closed autocracy. C) Resulted in electoral autocracy but declined over the years. 
    5- Deepened Democracy. Ep resulted in further liberalization or democratization of a political unit that was already classified as democracy. 
    6- Outcome Censored. The episode has the potency to democratize (dem_ep_prch == 1) but it is censored. Ask Vaness about this number cause I dont understand Who censored¿¿

--- Autocratization episodes---
  ·aut_ep, [0,1]
    Identifier of a autocratizacion episode, 
    0- No. 
    1- Episode.  

  ·aut_ep_prch, dummy [0,1] Episode with a Potencial Democratic Breakdown // Backslide Dem -> Aut
    Identifies if the described episode has the potencial for a democratic breakdown. 
    0- No. 
    1- Episode with a potencial transition.

  ·aut_ep_outcome, categorial [0,6] Autocratization outcome. 
    0- No autocratizacion during the year. 
    1- Democratic Breakdown. Political unit becoming a) closed autocrazy; b) electoral autocracy estable for one election; c) electoral autocracy stable min. over 5 years. 
    2- Preempted democratic breakdown. Political unit becomes an electoral autocracy, but reclaims its democratic status without celebrating autocratic elections.
    3- Diminshed democracy. Ep isode remains in democratic category but either reduce level of it or transition from liberal to electoral democracy. 
    4- Averted regression. Ep resulted a) never changed from liberal democracy; b) resulted in electoral democracy but reverted back to libral democracy; c) Resulted in electoral democracy but declined
    5- Regressed autocracy. The ep resulted in a further autocratizacion on a political unit already considered as autocratic. 
    6- Outcome Censored. The episode has the potency to autocratize (dem_ep_prch == 1) but it is censored. Ask Vaness about this number cause I dont understand Who censored¿¿
