from django.db import models

class Usuario(models.Model):
    ROLES = [
        ('admin', 'Administrador'),
        ('user', 'Usuario'),
        ('vip', 'VIP'),
    ]

    nombre = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    rol = models.CharField(max_length=10, choices=ROLES, default='user')

    def __str__(self):
        return f"{self.nombre} ({self.rol})"