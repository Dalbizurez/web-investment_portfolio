

def pendingEmail(username: str):
    subject = "Your account is pending approval"
    message = f"Hello {username},\n\nYour account is currently pending approval by an administrator. You will be notified once your account has been approved.\n\nThank you for your patience."
    return subject, message

def approvedEmail(username: str):
    subject = "Your account has been approved"
    message = f"Hello {username},\n\nCongratulations! Your account has been approved by an administrator. You can now log in and start using our services.\n\nThank you for joining us!"
    return subject, message