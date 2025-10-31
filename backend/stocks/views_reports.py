from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime
from decimal import Decimal
from django.db import transaction

from .models import ReportRequest
from .services.report_service import ReportService
from .emails.services import ReportEmailService

def _parse_date(s):
    if not s:
        return None
    try:
        # Expecting YYYY-MM-DD
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return None

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_report(request):
    """
    Create and synchronously generate a report, then email a link to the user.
    Body:
    {
      "date_from": "YYYY-MM-DD" | null,
      "date_to": "YYYY-MM-DD" | null,
      "include_current_valuation": true|false,
      "format": "PDF" | "CSV"
    }
    """
    user = request.user
    date_from = _parse_date(request.data.get("date_from"))
    date_to = _parse_date(request.data.get("date_to"))
    include_current = bool(request.data.get("include_current_valuation", True))
    fmt = str(request.data.get("format", "PDF")).upper()
    if fmt not in ("PDF", "CSV"):
        return Response({"error": "format must be 'PDF' or 'CSV'."}, status=400)

    if date_from and date_to and date_from > date_to:
        return Response({"error": "date_from cannot be after date_to."}, status=400)

    rr = ReportRequest.objects.create(
        user=user,
        date_from=date_from,
        date_to=date_to,
        include_current_valuation=include_current,
        format=fmt,
        status="PENDING",
    )

    try:
        ReportService.generate(rr)
        # Send notification
        ReportEmailService.send_report_ready_email(user, rr)
        return Response({
            "message": "Report generated and emailed.",
            "report_id": str(rr.id),
            "status": rr.status,
            "file_url": rr.file.url if rr.file else None
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        rr.status = "FAILED"
        rr.error_message = str(e)
        rr.finished_at = timezone.now()
        rr.save(update_fields=["status", "error_message", "finished_at"])
        return Response({"error": f"Failed to generate report: {str(e)}"}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def report_history(request):
    """
    List the authenticated user's report requests.
    Query params: none (pagination could be added later)
    """
    user = request.user
    qs = ReportRequest.objects.filter(user=user).order_by("-created_at")
    data = []
    for r in qs:
        data.append({
            "id": str(r.id),
            "date_from": r.date_from,
            "date_to": r.date_to,
            "include_current_valuation": r.include_current_valuation,
            "format": r.format,
            "status": r.status,
            "created_at": r.created_at,
            "started_at": r.started_at,
            "finished_at": r.finished_at,
            "file_url": r.file.url if r.file else None,
            "error_message": r.error_message,
        })
    return Response({"reports": data, "count": len(data)}, status=200)
