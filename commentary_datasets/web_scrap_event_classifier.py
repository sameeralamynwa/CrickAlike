import pandas as pd

from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import time

PATH = "/Users/sundus/Downloads/chromedriver.exe"
driver = webdriver.Chrome(PATH)

matches = ["https://www.cricbuzz.com/cricket-match-highlights/50958/ind-vs-rsa-2nd-odi-south-africa-tour-of-india-2022", 
           "https://www.cricbuzz.com/cricket-match-highlights/50951/ind-vs-rsa-1st-odi-south-africa-tour-of-india-2022",
           "https://www.cricbuzz.com/cricket-match-highlights/50963/ind-vs-rsa-3rd-odi-south-africa-tour-of-india-2022"]

target = []
commentary = []

def generate_dataset(url):
    driver.get(url)
    anchor_texts_innings = ['RSA 1st Inns', 'IND 1st Inns']
    big_events = ['Wickets', 'Fours', 'Sixes']

    page_soups = []
    index = 0
    
    for innings in anchor_texts_innings:
        link = driver.find_element(by = By.LINK_TEXT, value = innings)
        link.click()
        time.sleep(2)
        for event in big_events:
            event_link = driver.find_element(by = By.LINK_TEXT, value = event)
            event_link.click()
            time.sleep(2)
            page_soups.append(BeautifulSoup(driver.page_source, 'html.parser'))

    df = pd.DataFrame()
    for page in page_soups:
        innings_soup = page.find_all('div',{'class' : 'cb-col cb-col-8 text-bold ng-scope'})
        for soup in innings_soup:
            target.append(index)
            commentary.append(str(soup.next_element.next_element.next_element.next_element.next_element.next_element.text))
        index = (index + 1) % 3

for match_url in matches:
    generate_dataset(match_url)

df = pd.DataFrame.from_dict({
    'commentary': commentary,
    'target': target
})

df.to_csv("event_classifier.csv")

# driver.get("https://www.techwithtim.net/")

# search = driver.find_element(by = By.NAME, value = "s")
# search.send_keys("test")
# search.send_keys(Keys.RETURN)

# try:
#     main = WebDriverWait(driver, 10).until(
#         EC.presence_of_element_located((By.ID, "main"))
#     )
    
#     articles = main.find_elements(by = By.TAG_NAME, value = "article")
#     for article in articles:
#         summary = article.find_element(by = By.CLASS_NAME, value = "entry-summary")
        
# finally:
#     driver.quit()


# from bs4 import BeautifulSoup
# import requests

# source = requests.get('https://www.cricbuzz.com/cricket-match-highlights/43186/pak-vs-ban-41st-match-super-12-group-2-icc-mens-t20-world-cup-2022').text

# soup = BeautifulSoup(source, 'lxml')

# summary = soup.find('p', class_ = 'cb-col-90')
# paragraph = summary.find('div', class_ = 'cb-col cb-col-100 ng-scope')

# database = {
#     'commentary': ['Haris Rauf to Nasum Ahmed, FOUR, makes room and slaps the length delivery over mid-off. Nasum Ahmed got into position early to clear the off-side field and he got the desired length to execute the shot',
#                    'Mohammad Wasim Jr to Soumya Sarkar, SIX, Pakistan have competition today! Bangladesh are up for this in case you had other ideas. That was short, Soumya Sarkar goes back and slams the pull over deep square. That was so sweetly timed. He picked up the length quickly to help himself',
#                    "Haris Rauf to Nasum Ahmed, out Caught by Mohammad Wasim Jr!! Attempts the heave-ho off the pads and picks out deep mid-wicket to absolute perfection. The length was full and Nasum Ahmed dragged the slog off the thick inside half and couldn't quite get enough power on it as well."], 
    
#     'target': ['Four', 
#                'Six',
#                'Out'],
# }