<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your verification code</title>
</head>
<body style="margin:0; padding:24px; background-color:#f6f6f6; font-family:Arial, Helvetica, sans-serif;">
    <div style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:12px; padding:32px;">
        <h2 style="margin:0 0 16px; color:#9C0306; font-size:22px;">Verification code</h2>

        <p style="margin:0 0 12px; color:#333333;">Hi {{ $name }},</p>

        <p style="margin:0 0 12px; color:#333333;">
            Use the code below to finish signing in to UM-ERCH. It expires in 5 minutes.
        </p>

        <p style="margin:24px 0; text-align:center; font-size:34px; font-weight:bold; letter-spacing:10px; color:#111111;">
            {{ $otp }}
        </p>

        <p style="margin:0; color:#777777; font-size:13px;">
            If you did not request this code, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
