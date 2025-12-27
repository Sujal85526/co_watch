from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Room
        fields = ('id', 'name', 'code', 'youtube_url', 'owner_username', 'created_at')
        read_only_fields = ('id', 'code', 'owner_username', 'created_at')
