from distutils.log import debug
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
import pickle, os
from gensim.parsing.preprocessing import remove_stopwords
from nltk.stem import PorterStemmer  

app = Flask(__name__)

shot_categorization = pickle.load(open('pickled_files/shot_categorization', 'rb'))
tf_idf_shot = pickle.load(open('pickled_files/tf_idf_shot', 'rb'))
final_ordered_features_shot = pickle.load(open('pickled_files/final_ordered_features_shot', 'rb'))

even_classification = pickle.load(open('pickled_files/even_classification', 'rb'))
tf_idf_event = pickle.load(open('pickled_files/tf_idf_event', 'rb'))
final_ordered_features_event = pickle.load(open('pickled_files/final_ordered_features_event', 'rb'))

def ngrams(word_list):
    all_grams = []
    for index in range(len(word_list)):
        all_grams.append(word_list[index])
        if index + 1 < len(word_list):
            all_grams.append(word_list[index] + " " + word_list[index + 1])
        if index + 2 < len(word_list):
            all_grams.append(word_list[index] + " " + word_list[index + 1] + " " + word_list[2])
    
    return all_grams
    
def text_cleaning(text):
    ps = PorterStemmer()
    text = remove_stopwords(text)
    stemmed = ""
    for word in text.split():
        stemmed += ps.stem(word)
        stemmed += " "
    return stemmed

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict',methods=['POST'])
def predict_conditions():
    commentary = "what a great sweep to the off"
    commentary = text_cleaning(commentary)
    
    transformed_features_shot = tf_idf_shot.transform([commentary]).toarray()[0]
    input_features_shot = []
    
    for tf_idf_value in transformed_features_shot:
        input_features_shot.append(tf_idf_value)
    
    df_input_shot = pd.DataFrame([np.array(input_features_shot)], columns = final_ordered_features_shot)
    if shot_categorization.predict(df_input_shot)[0] == 0:
        return render_template('index.html', prediction_text='Encountered class is {}'.format(-1))
    
    transformed_features_event = tf_idf_shot.transform([commentary]).toarray()[0]
    input_features_event = []
    
    for tf_idf_value in transformed_features_event:
        input_features_event.append(tf_idf_value)
    
    df_input_event = pd.DataFrame([np.array(input_features_event)], columns = final_ordered_features_event)
    if even_classification.predict(df_input_shot)[0] == 0:
        predicted_event = "out"
    elif even_classification.predict(df_input_shot)[0] == 0:
        predicted_event = "four"
    else:
        predicted_event = "six"
    
    return render_template('index.html', prediction_text = 'Encountered class is {}'.format(predicted_event))

if __name__ == "__main__":
    app.run(port = int(os.getenv('PORT', 4444)), debug = True)