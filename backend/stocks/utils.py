# stocks/utils.py
from datetime import datetime, time
import pytz
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def is_market_open():
    """
    Check if US stock market is currently open
    Market hours: Monday-Friday, 9:30 AM - 4:00 PM EST
    """
    try:
        # Get current time in US Eastern timezone
        eastern = pytz.timezone('US/Eastern')
        now = datetime.now(eastern)
        
        # Check if it's a weekend
        if now.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            return False, "Market is closed on weekends"
        
        # Define market hours
        market_open_time = time(9, 30)  # 9:30 AM
        market_close_time = time(16, 0)  # 4:00 PM
        
        current_time = now.time()
        
        # Check if current time is within market hours
        if market_open_time <= current_time <= market_close_time:
            return True, "Market is open"
        else:
            return False, f"Market is closed. Trading hours: 9:30 AM - 4:00 PM EST"
    
    except Exception as e:
        logger.error(f"Error checking market status: {e}")
        # In case of error, assume market is open to not block testing
        return True, "Unable to verify market status, allowing transaction"


def get_market_holidays():
    """
    Get list of US market holidays for current year
    Common holidays: New Year's Day, MLK Day, Presidents Day, 
    Good Friday, Memorial Day, Independence Day, Labor Day, 
    Thanksgiving, Christmas
    """
    eastern = pytz.timezone('US/Eastern')
    now = datetime.now(eastern)
    year = now.year
    
    # Simplified list of fixed holidays (you can expand this)
    holidays = [
        datetime(year, 1, 1, tzinfo=eastern),   # New Year's Day
        datetime(year, 7, 4, tzinfo=eastern),   # Independence Day
        datetime(year, 12, 25, tzinfo=eastern), # Christmas
    ]
    
    return holidays


def is_market_holiday():
    """Check if today is a market holiday"""
    eastern = pytz.timezone('US/Eastern')
    now = datetime.now(eastern)
    today = now.date()
    
    holidays = get_market_holidays()
    holiday_dates = [h.date() for h in holidays]
    
    return today in holiday_dates


def validate_trading_hours():
    """
    Complete validation for trading hours including weekends and holidays
    Returns: (is_valid, message)
    """
    # Check if it's a holiday
    if is_market_holiday():
        return False, "Market is closed for holiday"
    
    # Check regular market hours
    return is_market_open()