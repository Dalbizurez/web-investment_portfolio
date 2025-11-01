from django.core.mail import EmailMultiAlternatives

def send_email(to_email: str, subject: str, body: str, htmlbody: str = None):
    context = {}
    email = EmailMultiAlternatives(
        subject=subject,
        body=body,
        #from_email="noreply@example.com",
        to=[to_email]
    )
    email.attach_alternative(htmlbody, "text/html")
    email.send()