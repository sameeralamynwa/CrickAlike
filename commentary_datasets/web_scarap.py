from bs4 import BeautifulSoup
import requests

source = requests.get('https://www.cricbuzz.com/cricket-match-highlights/43186/pak-vs-ban-41st-match-super-12-group-2-icc-mens-t20-world-cup-2022').text

soup = BeautifulSoup(source, 'lxml')

summary = soup.find('p', class_ = 'cb-col-90')
paragraph = summary.find('div', class_ = 'cb-col cb-col-100 ng-scope')

database = {
    'commentary': ['Haris Rauf to Nasum Ahmed, FOUR, makes room and slaps the length delivery over mid-off. Nasum Ahmed got into position early to clear the off-side field and he got the desired length to execute the shot',
                   'Mohammad Wasim Jr to Soumya Sarkar, SIX, Pakistan have competition today! Bangladesh are up for this in case you had other ideas. That was short, Soumya Sarkar goes back and slams the pull over deep square. That was so sweetly timed. He picked up the length quickly to help himself',
                   "Haris Rauf to Nasum Ahmed, out Caught by Mohammad Wasim Jr!! Attempts the heave-ho off the pads and picks out deep mid-wicket to absolute perfection. The length was full and Nasum Ahmed dragged the slog off the thick inside half and couldn't quite get enough power on it as well."], 
    
    'target': ['Four', 
               'Six',
               'Out'],
}