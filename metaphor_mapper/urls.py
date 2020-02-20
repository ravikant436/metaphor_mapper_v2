from django.contrib import admin
from django.urls import path
from . import views
urlpatterns = [
        path('', views.index, name='index'),
        path('hypo_list/', views.hypo_list, name='hypo_list'),
        path('most_similar/', views.most_similar, name='most_similar'),
        path('load_model/', views.load_model, name='load_model'),
   ]
