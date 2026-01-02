import json
from channels.generic.websocket import AsyncWebsocketConsumer


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["code"]
        self.room_group_name = f'room_{self.room_code}'
        self.username = None  # Will be set by frontend join message
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()


    async def disconnect(self, close_code):
        if self.username:  # Only send if user joined
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "presence_event",
                    "event": "user_left",
                    "username": self.username
                }
            )
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get("type", "")
            
            # Handle join message
            if msg_type == "join":
                self.username = data.get("username")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "presence_event",
                        "event": "user_joined",
                        "username": self.username
                    }
                )
                return
            
            # Handle chat message
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
            "username": event["username"]
        }))
