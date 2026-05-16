from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """Endpoitn para la verificacion de que el servicio backend esta corriendo y esta conectado"""
    return JsonResponse({"status": "Ok", "message": "Back funcionando correctamente"})

def db_check(request):
    """Endpoitn para la verificacion de que el servicio base de datos esta corriendo y esta conectado"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT mensaje FROM saludos LIMIT 1;")
            row = cursor.fetchone()

        if row:
            return JsonResponse({"status": "OK", "db_message": row[0]})
        else:
            return JsonResponse({"status": "WARNING", "db_message": "No se pudo conectar a la base de datos"})
        
    except Exception as e:
        return JsonResponse({"status": "ERROR", "db_message": str(e)}, status=500)