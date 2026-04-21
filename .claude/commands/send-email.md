# /send-email

Send an email (with optional file attachment) via the local postfix SMTP server on this Mac Mini.

## Usage

```
/send-email to:<address> subject:<text> [attach:<filepath>] [body:<text>]
```

## How it works

Parse the arguments from `$ARGUMENTS`, then run a Python script that connects to `localhost:25` (postfix) and sends the message. Postfix handles delivery — same mechanism used by the infrastructure health-check alerts.

## Implementation

Extract these fields from `$ARGUMENTS`:
- `to:` — recipient email address (required)
- `subject:` — email subject line (required)  
- `attach:` — absolute path to file to attach (optional)
- `body:` — plain text or HTML body (optional, defaults to a one-liner)

Then execute:

```python
import smtplib, sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os

to = "$TO"
subject = "$SUBJECT"
attach_path = "$ATTACH"   # empty string if not provided
body = "$BODY"            # fallback default if empty

msg = MIMEMultipart()
msg['From'] = 'ssergienko@pivotsdoo.com'
msg['To'] = to
msg['Subject'] = subject
msg.attach(MIMEText(body or f'<p>Email sent from Claude Code.</p>', 'html'))

if attach_path and os.path.exists(attach_path):
    filename = os.path.basename(attach_path)
    with open(attach_path, 'rb') as f:
        part = MIMEApplication(f.read(), Name=filename)
    part['Content-Disposition'] = f'attachment; filename="{filename}"'
    msg.attach(part)

with smtplib.SMTP('localhost') as s:
    s.sendmail(msg['From'], [to], msg.as_string())
print(f'Sent to {to}')
```

Run this via `python3 -c "..."` or write to `/tmp/send_email_task.py` and execute.

## Notes
- Sender is always `ssergienko@pivotsdoo.com` (postfix identity on this machine)
- May land in spam for external recipients — mention this to user
- For PDF/image attachments, MIME type is inferred automatically by MIMEApplication
- No authentication needed — postfix runs locally
