from django.urls import path
from django.views.decorators.csrf import csrf_exempt  
from . import views

urlpatterns = [
    path('register/', csrf_exempt(views.register), name='register'),  
    path('login/', csrf_exempt(views.login), name='login'),  
    path('me/', views.me, name='me'),
]
