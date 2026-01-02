from django.urls import re_path
from rooms.consumers import RoomConsumer

websocket_urlpatterns = [
    re_path(r'ws/room/(?P<code>\w+)/$', RoomConsumer.as_asgi()),  # ANY length
]

