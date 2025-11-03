# backend/user_try/views_admin.py
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q, Sum
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json

from user_try.models import User, UserSession, AuditLog
from stocks.models import (
    Transaction, Stock, ReportRequest, ReferralBonus, UserBalance,
    UserPortfolio, StockPriceHistory
)

# ---------- Admin guard ----------
def _require_admin(request):
    u = getattr(request, "user", None)
    return bool(u and getattr(u, "type", "") == "admin") or bool(u and getattr(u, "is_superuser", False))

def _forbidden():
    return HttpResponseForbidden(JsonResponse({"detail": "Admin only"}))

# ---------- Helpers ----------
def _paginate(request, qs, page_size_default=20):
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", page_size_default))
    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page)
    return page_obj, paginator

# ---------- USERS ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_users_list(request):
    if not _require_admin(request): return _forbidden()
    q = request.GET.get("q", "").strip()
    qs = User.objects.all().order_by("-created_at")
    if q:
        qs = qs.filter(Q(username__icontains=q) | Q(email__icontains=q) | Q(auth0_id__icontains=q) | Q(referral_code__icontains=q))
    page_obj, paginator = _paginate(request, qs)
    data = [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "type": u.type,
        "status": u.status,
        "referral_code": u.referral_code,
        "created_at": u.created_at.isoformat(),
        "last_login": u.last_login.isoformat() if u.last_login else None,
    } for u in page_obj.object_list]
    return JsonResponse({"results": data, "page": page_obj.number, "pages": paginator.num_pages, "total": paginator.count})

@csrf_exempt
@require_http_methods(["PATCH"])
def admin_users_update_status(request, user_id: int):
    if not _require_admin(request): return _forbidden()
    try:
        body = json.loads(request.body.decode("utf-8"))
        new_status = body.get("status")
    except Exception:
        return HttpResponseBadRequest(JsonResponse({"detail": "Invalid JSON"}))
    if new_status not in ["active", "suspended", "pending"]:
        return HttpResponseBadRequest(JsonResponse({"detail": "Invalid status"}))
    try:
        u = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return HttpResponseBadRequest(JsonResponse({"detail": "User not found"}))
    u.status = new_status
    u.save(update_fields=["status", "updated_at"])
    return JsonResponse({"ok": True})

@csrf_exempt
@require_http_methods(["PATCH"])
def admin_users_update_type(request, user_id: int):
    if not _require_admin(request): return _forbidden()
    try:
        body = json.loads(request.body.decode("utf-8"))
        new_type = body.get("type")
    except Exception:
        return HttpResponseBadRequest(JsonResponse({"detail": "Invalid JSON"}))
    if new_type not in ["standard", "vip", "admin"]:
        return HttpResponseBadRequest(JsonResponse({"detail": "Invalid type"}))
    try:
        u = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return HttpResponseBadRequest(JsonResponse({"detail": "User not found"}))
    u.type = new_type
    u.save(update_fields=["type", "updated_at"])
    return JsonResponse({"ok": True})

# ---------- TRANSACTIONS ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_transactions_list(request):
    if not _require_admin(request): return _forbidden()
    q_user = request.GET.get("user")
    tx_type = request.GET.get("type")
    from_date = request.GET.get("from")
    to_date = request.GET.get("to")
    qs = Transaction.objects.select_related("user", "stock").order_by("-created_at")
    if q_user:
        qs = qs.filter(Q(user__username__icontains=q_user) | Q(user__email__icontains=q_user))
    if tx_type:
        qs = qs.filter(transaction_type=tx_type.upper())
    if from_date:
        qs = qs.filter(created_at__gte=from_date)
    if to_date:
        qs = qs.filter(created_at__lte=to_date)
    page_obj, paginator = _paginate(request, qs, 30)
    data = [{
        "id": t.id,
        "user": t.user.username,
        "user_id": t.user_id,
        "type": t.transaction_type,
        "symbol": t.stock.symbol if t.stock else None,
        "quantity": t.quantity,
        "price": float(t.price) if t.price else None,
        "amount": float(t.amount),
        "fee": float(t.transaction_fee),
        "created_at": t.created_at.isoformat(),
    } for t in page_obj.object_list]
    return JsonResponse({"results": data, "page": page_obj.number, "pages": paginator.num_pages, "total": paginator.count})

# ---------- STOCKS ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_stocks_list(request):
    if not _require_admin(request): return _forbidden()
    q = request.GET.get("q", "").strip()
    qs = Stock.objects.all().order_by("symbol")
    if q:
        qs = qs.filter(Q(symbol__icontains=q) | Q(name__icontains=q))
    data = [{
        "id": s.id, "symbol": s.symbol, "name": s.name,
        "current_price": float(s.current_price or 0), "currency": s.currency,
        "exchange": s.exchange, "sector": s.sector,
        "is_active": s.is_active,
        "last_updated": s.last_updated.isoformat() if s.last_updated else None
    } for s in qs]
    return JsonResponse({"results": data})

@csrf_exempt
@require_http_methods(["POST"])
def admin_stocks_create(request):
    if not _require_admin(request): return _forbidden()
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest(JsonResponse({"detail": "Invalid JSON"}))
    if not body.get("symbol") or not body.get("name"):
        return HttpResponseBadRequest(JsonResponse({"detail": "symbol and name are required"}))
    s = Stock.objects.create(
        symbol=body["symbol"].upper(),
        name=body["name"],
        current_price=body.get("current_price") or 0,
        currency=body.get("currency") or "USD",
        exchange=body.get("exchange") or "",
        sector=body.get("sector") or "",
        is_active=True,
        last_updated=timezone.now(),
    )
    return JsonResponse({"id": s.id, "ok": True})

@csrf_exempt
@require_http_methods(["PATCH"])
def admin_stocks_update(request, stock_id: int):
    if not _require_admin(request): return _forbidden()
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest(JsonResponse({"detail": "Invalid JSON"}))
    try:
        s = Stock.objects.get(pk=stock_id)
    except Stock.DoesNotExist:
        return HttpResponseBadRequest(JsonResponse({"detail": "Stock not found"}))
    for field in ["name", "current_price", "currency", "exchange", "sector", "is_active"]:
        if field in body:
            setattr(s, field, body[field])
    s.last_updated = timezone.now()
    s.save()
    return JsonResponse({"ok": True})

@csrf_exempt
@require_http_methods(["DELETE"])
def admin_stocks_soft_delete(request, stock_id: int):
    if not _require_admin(request): return _forbidden()
    try:
        s = Stock.objects.get(pk=stock_id)
    except Stock.DoesNotExist:
        return HttpResponseBadRequest(JsonResponse({"detail": "Stock not found"}))
    s.is_active = False
    s.last_updated = timezone.now()
    s.save(update_fields=["is_active", "last_updated"])
    return JsonResponse({"ok": True})

# ---------- REPORT REQUESTS ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_reports_list(request):
    if not _require_admin(request): return _forbidden()
    qs = ReportRequest.objects.select_related("user").order_by("-created_at")
    page_obj, paginator = _paginate(request, qs)
    data = [{
        "id": r.id,
        "user": r.user.username,
        "user_id": r.user_id,
        "status": r.status,
        "format": r.format,
        "date_from": r.date_from.isoformat() if r.date_from else None,
        "date_to": r.date_to.isoformat() if r.date_to else None,
        "include_current_valuation": r.include_current_valuation,
        "file_url": (r.file.url if r.file else None),
        "created_at": r.created_at.isoformat(),
        "started_at": r.started_at.isoformat() if r.started_at else None,
        "finished_at": r.finished_at.isoformat() if r.finished_at else None,
        "error_message": r.error_message,
    } for r in page_obj.object_list]
    return JsonResponse({"results": data, "page": page_obj.number, "pages": paginator.num_pages, "total": paginator.count})

# ---------- REFERRAL BONUSES ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_referrals_list(request):
    if not _require_admin(request): return _forbidden()
    qs = ReferralBonus.objects.select_related("user", "referred_user").order_by("-created_at")
    page_obj, paginator = _paginate(request, qs)
    data = [{
        "id": b.id,
        "user": b.user.username, "user_id": b.user_id,
        "referred_user": b.referred_user.username if b.referred_user else None,
        "amount": float(b.amount),
        "created_at": b.created_at.isoformat(),
    } for b in page_obj.object_list]
    return JsonResponse({"results": data, "page": page_obj.number, "pages": paginator.num_pages, "total": paginator.count})

# ---------- BALANCES ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_balances_list(request):
    if not _require_admin(request): return _forbidden()
    qs = UserBalance.objects.select_related("user").order_by("user__username")
    data = [{
        "user": b.user.username, "user_id": b.user_id,
        "balance": float(b.balance),
        "updated_at": b.updated_at.isoformat() if b.updated_at else None,
    } for b in qs]
    total = qs.aggregate(total=Sum("balance"))["total"] or 0
    return JsonResponse({"results": data, "total_balance": float(total)})

# ---------- PORTFOLIO ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_portfolios_list(request):
    if not _require_admin(request): return _forbidden()
    user_id = request.GET.get("user_id")
    qs = UserPortfolio.objects.select_related("user", "stock").order_by("user__username", "stock__symbol")
    if user_id:
        qs = qs.filter(user_id=user_id)
    data = [{
        "user": p.user.username, "user_id": p.user_id,
        "symbol": p.stock.symbol, "stock_id": p.stock_id,
        "quantity": p.quantity,
        "average_price": float(p.average_price),
        "created_at": p.created_at.isoformat(),
    } for p in qs]
    return JsonResponse({"results": data})

# ---------- STOCK PRICE HISTORY ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_sph_list(request):
    if not _require_admin(request): return _forbidden()
    symbol = request.GET.get("symbol")
    qs = StockPriceHistory.objects.select_related("stock").order_by("-timestamp")
    if symbol:
        qs = qs.filter(stock__symbol__iexact=symbol)
    page_obj, paginator = _paginate(request, qs, 50)
    data = [{
        "stock": h.stock.symbol, "price": float(h.price), "timestamp": h.timestamp.isoformat()
    } for h in page_obj.object_list]
    return JsonResponse({"results": data, "page": page_obj.number, "pages": paginator.num_pages, "total": paginator.count})

# ---------- AUDIT LOGS ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_audit_list(request):
    if not _require_admin(request): return _forbidden()
    q_user = request.GET.get("user")
    action = request.GET.get("action")
    qs = AuditLog.objects.select_related("user").order_by("-timestamp")
    if q_user:
        qs = qs.filter(Q(user__username__icontains=q_user) | Q(user__email__icontains=q_user))
    if action:
        qs = qs.filter(action=action)
    page_obj, paginator = _paginate(request, qs, 40)
    data = [{
        "id": a.id,
        "user": (a.user.username if a.user else "System"),
        "action": a.action,
        "ip_address": a.ip_address,
        "user_agent": a.user_agent,
        "timestamp": a.timestamp.isoformat(),
        "details": a.details,
    } for a in page_obj.object_list]
    return JsonResponse({"results": data, "page": page_obj.number, "pages": paginator.num_pages, "total": paginator.count})

# ---------- SESSIONS ----------
@csrf_exempt
@require_http_methods(["GET"])
def admin_sessions_list(request):
    if not _require_admin(request): return _forbidden()
    qs = UserSession.objects.select_related("user").order_by("-created_at")
    data = [{
        "id": s.id,
        "user": s.user.username, "user_id": s.user_id,
        "is_active": s.is_active,
        "created_at": s.created_at.isoformat(),
        "expires_at": s.expires_at.isoformat(),
        "ip_address": s.ip_address, "user_agent": s.user_agent,
    } for s in qs]
    return JsonResponse({"results": data})

@csrf_exempt
@require_http_methods(["PATCH"])
def admin_sessions_deactivate(request, session_id: int):
    if not _require_admin(request): return _forbidden()
    try:
        s = UserSession.objects.get(pk=session_id)
    except UserSession.DoesNotExist:
        return HttpResponseBadRequest(JsonResponse({"detail": "Session not found"}))
    s.is_active = False
    s.save(update_fields=["is_active"])
    return JsonResponse({"ok": True})
