from django.shortcuts import render
from django.http import HttpResponse
import nltk
nltk.download('wordnet')
from nltk.corpus import wordnet as wn
import gensim
import time
from gensim.models import KeyedVectors
import os
from metaphor_setup64.settings import BASE_DIR

#filename = 'glove.6B.50d.txt.word2vec'
#model = KeyedVectors.load_word2vec_format(file_path, binary=False, limit=50000)

# Create your views here.
def index(request):
    return render(request, 'metaphor_mapper/index.html')

def load_model(request):
    global model
    try:
        file_path = os.path.join(BASE_DIR, os.getcwd() + '\\metaphor_mapper\\' + str(request.POST['dataset']))
        if request.POST['dataset'] == 'GoogleNews-vectors-negative300.bin' :
            model = KeyedVectors.load_word2vec_format(file_path, binary=True, limit=1500000)
        else:
            model = KeyedVectors.load_word2vec_format(file_path, binary=False)
    except:
        return HttpResponse(False)
    return HttpResponse(True)

def hypo_list(request):
    if request.method == 'POST':
        name = request.POST['name']
        hypo_nym_list = ""
        for ss in wn.synsets(name):
            for hypo in ss.hyponyms():
                hypo_nym_list = hypo_nym_list + str(hypo.name()) + ","
    return HttpResponse(hypo_nym_list)

def most_similar(request):
    if request.method == 'POST':
        terms_string = request.POST['name']
        print(terms_string)
        terms_list = terms_string.split(",")
        try:
            result = model.most_similar(positive=[terms_list[2], terms_list[1]], negative=[terms_list[0]], topn=6)
            print(result)
            result = str(result)
        except:
            return HttpResponse("NA")
    return HttpResponse(result)
