from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, join_room_by_code

router = DefaultRouter()
router.register('rooms', RoomViewSet, basename='room')

urlpatterns = [
    path('', include(router.urls)),
    path('rooms/join/', join_room_by_code, name='join-room-by-code'),
]
