from django.template.loader import render_to_string

def pendingEmail(username: str):
    subject = "Your account is pending approval"
    html_message = render_to_string("../templates/emails/pending.html", {"username": username})
    text_content = render_to_string("../templates/emails/pending.txt", {"username": username})
    return subject, html_message, text_content

def approvedEmail(username: str):
    subject = "Your account has been approved"
    html_message = render_to_string("../templates/emails/approved.html", {"username": username})
    text_content = render_to_string("../templates/emails/approved.txt", {"username": username})
    return subject, html_message, text_content