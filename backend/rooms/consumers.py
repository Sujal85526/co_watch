import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["code"]
        self.room_group_name = f'room_{self.room_code}'
        self.username = None
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if self.username:
            # Remove from cache
            cache_key = f'room_{self.room_code}_users'
            users = cache.get(cache_key, set())
            users.discard(self.username)
            cache.set(cache_key, users, 3600)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "presence_event",
                    "event": "user_left",
                    "username": self.username,
                    "online_count": len(users)
                }
            )
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get("type", "")
            
            # Handle join event
            if msg_type == "join":
                self.username = data.get("username")
                
                # Add to cache
                cache_key = f'room_{self.room_code}_users'
                users = cache.get(cache_key, set())
                users.add(self.username)
                cache.set(cache_key, users, 3600)
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "presence_event",
                        "event": "user_joined",
                        "username": self.username,
                        "online_count": len(users)
                    }
                )
                return
            
            # Handle video action events
            if msg_type == "video_action":
                action = data.get("action")
                username = data.get("username")
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "video_action",
                        "action": action,
                        "username": username
                    }
                )
                return
            
            # Handle seek events
            if msg_type == "seek":
                timestamp = data.get("timestamp")
                username = data.get("username")
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "video_seek",
                        "timestamp": timestamp,
                        "username": username
                    }
                )
                return
            
            # ✅ NEW: Handle video URL change events
            if msg_type == "video_url_changed":
                new_url = data.get("url")
                username = data.get("username")
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "video_url_changed",
                        "url": new_url,
                        "username": username
                    }
                )
                return
            
            # Handle chat messages
            if msg_type == "chat_message":
                message = data.get("message", "")
                username = data.get("username")
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": message,
                        "username": username
                    }
                )
                return
                
        except Exception as e:
            print(f"WS receive error: {e}")

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "username": event["username"]
        }))

    async def presence_event(self, event):
        await self.send(text_data=json.dumps({
            "type": event["event"],
            "username": event["username"],
            "online_count": event.get("online_count", 1)  
        }))

    async def video_action(self, event):
        await self.send(text_data=json.dumps({
            "type": "video_action",
            "action": event["action"],
            "username": event["username"]
        }))

    async def video_seek(self, event):
        await self.send(text_data=json.dumps({
            "type": "seek",
            "timestamp": event["timestamp"],
            "username": event["username"]
        }))

    # ✅ NEW: Video URL change broadcast handler
    async def video_url_changed(self, event):
        await self.send(text_data=json.dumps({
            "type": "video_url_changed",
            "url": event["url"],
            "username": event["username"]
        }))
