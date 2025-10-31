import io
import os
from datetime import timezone
from datetime import datetime, date
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.utils import timezone as dj_timezone
from django.core.files.base import ContentFile

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib import colors

from stocks.models import Transaction, UserPortfolio, ReportRequest, Stock
from stocks.services.finnhub_service import FinnhubService


class ReportService:
    """
    Builds on-demand user reports (PDF or CSV) from transactions + optional current valuation.
    """

    @staticmethod
    def _parse_range(date_from, date_to):
        start = datetime.combine(date_from, datetime.min.time(), tzinfo=timezone.utc) if date_from else None
        end = datetime.combine(date_to, datetime.max.time(), tzinfo=timezone.utc) if date_to else None
        return start, end

    @staticmethod
    def _query_transactions(user, date_from=None, date_to=None):
        qs = Transaction.objects.filter(user=user).select_related('stock')
        if date_from:
            qs = qs.filter(created_at__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__lte=date_to)
        return qs.order_by('created_at')

    @staticmethod
    def _compute_cash_flows(transactions):
        total_deposits = Decimal('0')
        total_withdrawals = Decimal('0')
        total_buys = Decimal('0')
        total_sells = Decimal('0')
        total_fees = Decimal('0')
        total_referrals = Decimal('0')

        for tx in transactions:
            try:
                amt = Decimal(str(tx.amount))
            except (InvalidOperation, TypeError):
                amt = Decimal('0')

            total_fees += Decimal(str(tx.transaction_fee or 0))

            if tx.transaction_type == 'DEPOSIT':
                total_deposits += amt
            elif tx.transaction_type == 'WITHDRAWAL':
                total_withdrawals += -amt if amt < 0 else amt
            elif tx.transaction_type == 'BUY':
                total_buys += -amt if amt < 0 else amt
            elif tx.transaction_type == 'SELL':
                total_sells += amt
            elif tx.transaction_type == 'REFERRAL':
                total_referrals += amt

        net_cash_flow = total_deposits + total_referrals + total_sells - total_withdrawals - total_buys - total_fees

        return {
            'total_deposits': total_deposits,
            'total_withdrawals': total_withdrawals,
            'total_buys': total_buys,
            'total_sells': total_sells,
            'total_fees': total_fees,
            'total_referrals': total_referrals,
            'net_cash_flow': net_cash_flow,
        }

    @staticmethod
    def _compute_current_valuation(user):
        service = FinnhubService()
        items = UserPortfolio.objects.filter(user=user).select_related('stock')
        rows = []
        total_value = Decimal('0')
        total_cost = Decimal('0')

        for item in items:
            symbol = item.stock.symbol
            quote = service.get_stock_quote(symbol) or {}
            current_price = Decimal(str(quote.get('current_price', item.stock.current_price or 0)))
            current_value = current_price * Decimal(item.quantity)
            invested_value = Decimal(item.quantity) * Decimal(item.average_price)
            profit = current_value - invested_value

            rows.append({
                'symbol': symbol,
                'name': item.stock.name,
                'quantity': item.quantity,
                'avg_price': Decimal(item.average_price),
                'current_price': current_price,
                'current_value': current_value,
                'invested_value': invested_value,
                'profit': profit,
            })

            total_value += current_value
            total_cost += invested_value

        total_profit = total_value - total_cost
        pct = (total_profit / total_cost * 100) if total_cost > 0 else Decimal('0')

        return rows, {
            'total_cost': total_cost,
            'total_value': total_value,
            'total_profit': total_profit,
            'total_profit_pct': pct,
        }

    @staticmethod
    def _write_pdf(user, tx_rows, cash_summary, valuation_rows, valuation_summary, date_from, date_to):
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        width, height = A4

        def hline(y):
            c.setStrokeColor(colors.lightgrey)
            c.line(2 * cm, y, width - 2 * cm, y)

        c.setFont("Helvetica-Bold", 16)
        c.drawString(2 * cm, height - 2 * cm, "Investment Report")
        c.setFont("Helvetica", 10)
        c.drawString(2 * cm, height - 2.6 * cm, f"User: {user.username}  |  Email: {user.email}")

        dr = date_from.date().isoformat() if date_from else "beginning"
        dt = date_to.date().isoformat() if date_to else "today"

        c.drawString(
            2 * cm,
            height - 3.2 * cm,
            f"Date range: {dr} — {dt}  |  Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC"
        )
        hline(height - 3.4 * cm)

        y = height - 4.1 * cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(2 * cm, y, "Cash Flow Summary")
        y -= 0.5 * cm
        c.setFont("Helvetica", 10)

        for label, key in [
            ("Deposits", "total_deposits"),
            ("Withdrawals", "total_withdrawals"),
            ("Buys (cash out)", "total_buys"),
            ("Sells (cash in)", "total_sells"),
            ("Fees", "total_fees"),
            ("Referral bonuses", "total_referrals"),
            ("Net cash flow", "net_cash_flow"),
        ]:
            c.drawString(2 * cm, y, f"{label}:")
            c.drawRightString(width - 2 * cm, y, f"${cash_summary[key]:,.2f}")
            y -= 0.45 * cm

        y -= 0.2 * cm
        hline(y)
        y -= 0.6 * cm

        if valuation_rows is not None:
            c.setFont("Helvetica-Bold", 12)
            c.drawString(2 * cm, y, "Current Portfolio Valuation")
            y -= 0.5 * cm
            c.setFont("Helvetica-Bold", 9)

            headers = ["Symbol", "Qty", "Avg", "Price", "Value", "P/L"]
            xcols = [2 * cm, 6 * cm, 8 * cm, 10 * cm, 12.5 * cm, 15 * cm]

            for i, h in enumerate(headers):
                c.drawString(xcols[i], y, h)

            y -= 0.35 * cm
            c.setFont("Helvetica", 9)

            for row in valuation_rows:
                if y < 3 * cm:
                    c.showPage()
                    y = height - 2 * cm

                c.drawString(xcols[0], y, row['symbol'])
                c.drawRightString(xcols[1], y, f"{row['quantity']}")
                c.drawRightString(xcols[2], y, f"${row['avg_price']:,.2f}")
                c.drawRightString(xcols[3], y, f"${row['current_price']:,.2f}")
                c.drawRightString(xcols[4], y, f"${row['current_value']:,.2f}")
                c.drawRightString(xcols[5], y, f"${row['profit']:,.2f}")
                y -= 0.32 * cm

            y -= 0.2 * cm
            hline(y)
            y -= 0.5 * cm
            c.setFont("Helvetica-Bold", 10)
            c.drawString(2 * cm, y, "Valuation Summary")
            y -= 0.45 * cm
            c.setFont("Helvetica", 10)

            for label, val in [
                ("Total cost", valuation_summary['total_cost']),
                ("Total value", valuation_summary['total_value']),
                ("Total profit", valuation_summary['total_profit']),
                ("Profit %", valuation_summary['total_profit_pct']),
            ]:
                c.drawString(2 * cm, y, f"{label}:")
                suffix = "%" if label == "Profit %" else ""
                c.drawRightString(width - 2 * cm, y, f"{val:,.2f}{suffix}")
                y -= 0.4 * cm

            y -= 0.2 * cm
            hline(y)
            y -= 0.6 * cm

        c.setFont("Helvetica-Bold", 12)
        c.drawString(2 * cm, y, "Transaction History")
        y -= 0.5 * cm
        c.setFont("Helvetica-Bold", 9)

        headers = ["Date", "Type", "Symbol", "Qty", "Price", "Amount", "Fee"]
        xcols = [2 * cm, 5 * cm, 7.5 * cm, 10 * cm, 11.5 * cm, 13.5 * cm, 16 * cm]

        for i, h in enumerate(headers):
            c.drawString(xcols[i], y, h)

        y -= 0.35 * cm
        c.setFont("Helvetica", 9)

        for row in tx_rows:
            if y < 2 * cm:
                c.showPage()
                y = height - 2 * cm

            c.drawString(xcols[0], y, row['date'])
            c.drawString(xcols[1], y, row['type'])
            c.drawString(xcols[2], y, row['symbol'] or "-")
            c.drawRightString(xcols[3], y, f"{row['quantity'] or 0}")
            c.drawRightString(xcols[4], y, f"${row['price'] or 0:,.2f}")
            c.drawRightString(xcols[5], y, f"${row['amount']:,.2f}")
            c.drawRightString(xcols[6], y, f"${row['fee']:,.2f}")
            y -= 0.3 * cm

        c.showPage()
        c.save()
        buf.seek(0)
        return ContentFile(buf.read())

    @staticmethod
    def _write_csv(user, tx_rows, cash_summary, valuation_rows, valuation_summary, date_from, date_to):
        import csv
        buf = io.StringIO()
        w = csv.writer(buf)

        dr = date_from.date().isoformat() if date_from else "beginning"
        dt = date_to.date().isoformat() if date_to else "today"

        w.writerow(["Investment Report"])
        w.writerow(["User", user.username])
        w.writerow(["Email", user.email])
        w.writerow(["Date range", f"{dr} - {dt}"])
        w.writerow(["Generated", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")])
        w.writerow([])

        w.writerow(["Cash Flow Summary"])
        for label, key in [
            ("Deposits", "total_deposits"),
            ("Withdrawals", "total_withdrawals"),
            ("Buys (cash out)", "total_buys"),
            ("Sells (cash in)", "total_sells"),
            ("Fees", "total_fees"),
            ("Referral bonuses", "total_referrals"),
            ("Net cash flow", "net_cash_flow"),
        ]:
            w.writerow([label, f"{cash_summary[key]:.2f}"])
        w.writerow([])

        if valuation_rows is not None:
            w.writerow(["Current Portfolio Valuation"])
            w.writerow(["Symbol", "Qty", "Avg", "Price", "Value", "P/L"])
            for row in valuation_rows:
                w.writerow([
                    row['symbol'],
                    row['quantity'],
                    f"{row['avg_price']:.2f}",
                    f"{row['current_price']:.2f}",
                    f"{row['current_value']:.2f}",
                    f"{row['profit']:.2f}",
                ])
            w.writerow([])

            w.writerow(["Valuation Summary"])
            w.writerow(["Total cost", f"{valuation_summary['total_cost']:.2f}"])
            w.writerow(["Total value", f"{valuation_summary['total_value']:.2f}"])
            w.writerow(["Total profit", f"{valuation_summary['total_profit']:.2f}"])
            w.writerow(["Profit %", f"{valuation_summary['total_profit_pct']:.2f}"])
            w.writerow([])

        w.writerow(["Transaction History"])
        w.writerow(["Date", "Type", "Symbol", "Qty", "Price", "Amount", "Fee"])

        for row in tx_rows:
            w.writerow([
                row['date'],
                row['type'],
                row['symbol'] or "",
                row['quantity'] or 0,
                f"{row['price'] or 0:.2f}",
                f"{row['amount']:.2f}",
                f"{row['fee']:.2f}",
            ])

        data = buf.getvalue().encode("utf-8")
        return ContentFile(data)

    @classmethod
    def generate(cls, report_request: ReportRequest):
        report_request.status = "GENERATING"
        report_request.started_at = dj_timezone.now()
        report_request.save(update_fields=["status", "started_at"])

        user = report_request.user
        date_from, date_to = cls._parse_range(report_request.date_from, report_request.date_to)
        tx_qs = cls._query_transactions(user, date_from, date_to)

        tx_rows = []
        for tx in tx_qs:
            tx_rows.append({
                "date": tx.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "type": tx.transaction_type,
                "symbol": tx.stock.symbol if tx.stock else None,
                "quantity": tx.quantity,
                "price": float(tx.price) if tx.price else None,
                "amount": float(tx.amount),
                "fee": float(tx.transaction_fee),
            })

        cash_summary = cls._compute_cash_flows(tx_qs)

        valuation_rows = None
        valuation_summary = None

        if report_request.include_current_valuation:
            valuation_rows, valuation_summary = cls._compute_current_valuation(user)

        if report_request.format == "PDF":
            content = cls._write_pdf(user, tx_rows, cash_summary, valuation_rows, valuation_summary, date_from, date_to)
            filename = f"report_{report_request.id}.pdf"
        else:
            content = cls._write_csv(user, tx_rows, cash_summary, valuation_rows, valuation_summary, date_from, date_to)
            filename = f"report_{report_request.id}.csv"

        report_request.file.save(filename, content, save=True)
        report_request.status = "COMPLETED"
        report_request.finished_at = dj_timezone.now()
        report_request.save(update_fields=["file", "status", "finished_at"])

        return report_request
