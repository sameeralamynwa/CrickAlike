import pandas as pd

from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import time
import requests

PATH = "/Users/sundus/Downloads/chromedriver.exe"
driver = webdriver.Chrome(PATH)

matches = ["india_vs_rsa_1st.html",
           "india_vs_rsa_2nd.html",
           "india_vs_rsa_3rd.html"]

target = []
commentary = []

def generate_dataset(file):
    page_soup = BeautifulSoup(open(file), 'html.parser')

    commentaries_soup = page_soup.find_all('p',{'class' : 'cb-com-ln ng-binding ng-scope cb-col cb-col-90'})
    time.sleep(3)
    for commentary_text in commentaries_soup:
        event = commentary_text.text.split(',')[1]
        commentary.append(commentary_text.text)
        if event == ' FOUR' or event == ' SIX' or event[1:4] == 'out':
            target.append(1)
        else:
            target.append(0)


for match_url in matches:
    generate_dataset(match_url)

df = pd.DataFrame.from_dict({
    'commentary': commentary,
    'target': target
})

df.to_csv("shot_categorization.csv")
