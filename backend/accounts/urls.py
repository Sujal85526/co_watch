from django.urls import path
from django.views.decorators.csrf import csrf_exempt  # ✅ ADD THIS
from . import views

urlpatterns = [
    path('register/', csrf_exempt(views.register), name='register'),  # ✅ WRAP
    path('login/', csrf_exempt(views.login), name='login'),  # ✅ WRAP
    path('me/', views.me, name='me'),
]
