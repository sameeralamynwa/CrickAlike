import numpy as np
import pandas as pd

from flask import Flask, request, jsonify, render_template
from flask_restful import Resource, Api

from gensim.parsing.preprocessing import remove_stopwords
from nltk.stem import PorterStemmer
import re

from distutils.log import debug
import pickle, os
import warnings

warnings.filterwarnings('ignore')

app = Flask(__name__)
api = Api(app)

shot_categorization = pickle.load(open('pickled_files/shot_categorization', 'rb'))
tf_idf_shot = pickle.load(open('pickled_files/tf_idf_shot', 'rb'))
final_ordered_features_shot = pickle.load(open('pickled_files/final_ordered_shot', 'rb'))

event_classification = pickle.load(open('pickled_files/event_classification', 'rb'))
tf_idf_event = pickle.load(open('pickled_files/tf_idf_event', 'rb'))
final_ordered_features_event = pickle.load(open('pickled_files/final_ordered_event', 'rb'))

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
        word = re.sub(r"[^a-zA-Z]+", '', word)
        word = word.strip()
        word = word.lower()
        word = ps.stem(word)
        word = word.strip()
        stemmed += word
        stemmed += " "
    return stemmed

class Prediction(Resource):
    def get(self, commentary):
        print(commentary)
        commentary = text_cleaning(commentary)
        
        transformed_features_shot = tf_idf_shot.transform([commentary]).toarray()[0]
        input_features_shot = []
        
        for tf_idf_value in transformed_features_shot:
            input_features_shot.append(tf_idf_value)
        
        df_input_shot = pd.DataFrame([np.array(input_features_shot)], columns = final_ordered_features_shot)
        if shot_categorization.predict(df_input_shot)[0] == 0:
            return jsonify({
                'predicted_event': 'skip'
            })
        
        transformed_features_event = tf_idf_event.transform([commentary]).toarray()[0]
        input_features_event = []
        
        for tf_idf_value in transformed_features_event:
            input_features_event.append(tf_idf_value)
        
        df_input_event = pd.DataFrame([np.array(input_features_event)], columns = final_ordered_features_event)
        if event_classification.predict(df_input_event)[0] == 0:
            predicted_event = "out"
        elif event_classification.predict(df_input_event)[0] == 1:
            predicted_event = "four"
        else:
            predicted_event = "six"
        
        return jsonify({
            'predicted_event': predicted_event
        })

api.add_resource(Prediction, "/predict_event/<string:commentary>", methods = ['GET'])

if __name__ == "__main__":
    app.run(port = int(os.getenv('PORT', 4444)), debug = True)