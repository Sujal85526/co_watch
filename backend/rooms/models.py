from django.db import models
from django.contrib.auth.models import User
import secrets

class Room(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_rooms')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=8, unique=True, db_index=True)
    youtube_url = models.URLField(blank=True, null=True)
    current_time = models.IntegerField(default=0)  # ← ADD THIS LINE
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = secrets.token_hex(3)  # 6-char code
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"
