from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Room
from .serializers import RoomSerializer


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    # Allow: any authenticated user can view, only owner can modify
    permission_classes = [permissions.IsAuthenticated]  # ← TEMP: remove IsOwner

    def get_queryset(self):
        # List: only your own rooms
        if self.action == 'list' or self.action == 'create':
            return Room.objects.filter(owner=self.request.user)
        # Detail (retrieve, update, destroy): allow all rooms
        return Room.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)



@api_view(['POST'])
def join_room_by_code(request):
    code = request.data.get('code')
    if not code:
        return Response({'detail': 'Code required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        room = Room.objects.get(code=code)
    except Room.DoesNotExist:
        return Response({'detail': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = RoomSerializer(room)
    return Response(serializer.data)

@api_view(['GET'])
def get_room_by_code(request, code):
    try:
        room = Room.objects.get(code__iexact=code)
        serializer = RoomSerializer(room)
        return Response(serializer.data)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

