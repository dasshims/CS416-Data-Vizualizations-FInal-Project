# Narrative visualization to study the impact of an Economic Recessions on US Housing Market


## Overview
Home prices in the US have always remained susceptible to market dynamics, exhibiting fluctuations over time as they rise and fall in response to the overall market outlook. Through this narrative visualization project we delve into the intricacies of the housing market and economic recession.
Data source
Data is sourced from Zillow Research and represents Single family houses across the United States. The data was massaged and filtered using excel data manipulation (filter to remove null values, transpose to convert column to rows). Some states had to be taken out because of unavailability of data. I am using d3 + html + css to define the viz. I am hosting my page using github pages. Source code is available here.

## Messaging
The narrative visualization aims to establish a meaningful correlation between housing prices across the United States and the prevailing economic conditions, encompassing a comprehensive dataset spanning from January 2000 to June 2023. By illustrating this data, the project seeks to provide viewers with a comprehensive understanding of -


How housing prices have changed in relation to economic recessions over the years.
The messaging seeks to associate major economic events with corresponding changes in housing prices. Annotations in the visualization highlight events such as the subprime mortgage crisis, inflation or significant policy changes that have influenced the housing market.
The visualization encourages user interaction and exploration by providing the ability to drill down the data by clicking into specific states. Details on demand tooltip provides users with more minute details, each point in the chart shows the housing price on a specific month. This empowers users to personalize their viewing experience and extract specific insights relevant to their interests.


## Narrative Structure
This project uses Martini glass narrative visualization structure. The visualization starts with the author defined path that shows the US average single family housing prices plotted as a line chart, over the period of January 2000 to June 2023, with year on the x-axis and price on the y-axis.

The page loads with guides about how to navigate the chart. This points the user to buttons for each scene, the observation area created by the author, buttons for clearing and reloading the chart, and the state selector button to drill down further into the data.

Then the user is taken on a guided journey through each scene, allowing them to observe the changes in housing prices over each economic recession period. Once each scene is finished loading, the user is prompted to move to the next scene. This represents the stem of the Martini glass.

Once all the scenes are finished loading. Users are prompted with more options to play around, this represents the jumping off point in the Martini glass. The user can at this point check the price variance for each state, and/or toggle through different periods. 


## Visual Structure
    Since the dates are quantitative continuous independent variables and the housing prices are continuous dependent values it makes sense to use a line chart, it helps in comparing and highlighting trends. The chart portrays the cyclical nature of the economy, revealing a reassuring truth: despite fluctuations, prices will inevitably ascend over time. This visual structure is consistent in each scene, this aligns with the narrative's goals and the data's complexity. 
    The annotations in each scene urges the viewer to focus on either a tipping point in the chart or a long upward rally that occurred because of favorable conditions. It ensures to enhance the audience's understanding, engagement, and overall storytelling. 


Figure 1: All the components of visualization



## Scenes
The visualization is divided into 3 separate scenes, with each scene representing a specific economic period. Scenes are ordered chronologically from oldest to newest year. Given the interconnectedness of recessions, where the impact of one scene unfolds into the next, an ordered fashion becomes essential to understand the chain of cause and effect.". 
Scenes are as described below - 
    Scene 1 - The period between 2000 and 2008. The mild recession in early 2000s as a result of the dot-com bubble burst and 9/11 terrorist attack represents a slight Decline In economic activity that moderately affected the housing market.
    Scene 2- The period between 2008 and 2020. This Represents the great recession and housing crisis of 2007-08.
    Scene 3- Period between covid pandemic and 2023. This represents how the market changed on and after covid with events such as - record low interest rates, followed by a rise in housing prices, subsequently followed by a record high inflation.


## Annotations
    I have used Textual annotations. Annotations in the chart are used to draw attention specific events and tell the story for each scene. There are two kinds of annotations in the project  explained below -
    A bulletin right at the top of the chart that gives a brief description of the current scene. This is a summary of the economic situation during that period and factors that could affect the housing market at that time. The old annotations persist from the previous scene and users can scroll up to go to the old annotation.
    The line chart is loaded with annotations for each major data point in the line. They follow the same consistent template throughout every scene. New annotations reinforce as we go from one scene to the next.


Also, hovering over each point on the line provides the user with an interactive tooltip that displays the specific housing price value broken up for each month. This feature enables users to gain more precise insights into the data.


## Parameters
There are different kinds of parameters used in the visualization. They are explained as below -
    The major parameter in my visualization is the scene selector buttons, representing each scene in the narrative visualization. The scene parameter has 3 states, namely Scene 1, 2 and 3. The value of this parameter controls the max_year variable in the javascript code and that in-turn controls what data is displayed in the chart. As the value of this parameter is changed we move from one state of the chart to another, creating a state machine.
    State selector button appears at the end of Martini Glass flow, this allows users to redraw the chart and drill down into each state’s data. The value of the <option> element determines the region_name variable in the javascript code, it filters the data using the regionName column and the chart is drawn accordingly.
    Reload button is used to bring the visualization to the initial state. This allows the user to re-execute the flow from the beginning. 
    Clear is a parameter to clear the chart content using d3.selectAll('svg').remove() function, this clears all the svg elements in the page.


## Triggers
### Triggers in the visualization are -
    Scenes - this triggers the narrative visualization to go from one scene to another.
    State selector drop down list - this triggers the chart to be drawn depending on the state value selected.
    Clear - clears the entire chart.
    Reload - Reloads the chart from the beginning.
    
    At the start, the buttons for scenes 2 & 3 will be disabled, but as soon as the chart finishes loading scene 1, a popup will guide the user towards the next scene 2 and so on.

    Similarly, the state selector drop down list will appear after each scene is finished loading.
