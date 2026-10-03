<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Your UM-ERCH verification code</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:24px 12px; background-color:#F6F6F6; font-family:'Montserrat','Helvetica Neue',Helvetica,Arial,sans-serif; -webkit-text-size-adjust:100%;">

    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; mso-hide:all; font-size:1px; line-height:1px;">
        A verification code is waiting for you &#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F6F6F6;">
        <tr>
            <td align="center" style="padding:24px 12px 8px;">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:480px; background-color:#FFFFFF;">

                    <tr>
                        <td align="center" bgcolor="#9C0306" style="background-color:#9C0306; border-radius:16px 16px 0 0; padding:30px 32px 26px;">
                            <img
                                src="{{ $message->embed(base_path('resources/images/umerch-wordmark-white.png')) }}"
                                width="180"
                                height="38"
                                alt="UMERCH"
                                style="display:block; width:180px; height:auto; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;"
                            >
                        </td>
                    </tr>

                    <tr>
                        <td align="center" bgcolor="#9C0306" style="background-color:#9C0306; padding:0 0 26px;">
                            <div style="width:64px; height:4px; background-color:#FFB600; border-radius:2px; font-size:0; line-height:0;">&nbsp;</div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px 32px 28px;">
                            <div style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; line-height:1.4; text-transform:uppercase; color:#FFB600;">
                                Security verification
                            </div>

                            <h1 style="margin:0; font-size:24px; line-height:1.25; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#9C0306;">
                                Verification Code
                            </h1>

                            <p style="margin:20px 0 0; font-size:15px; line-height:1.6; color:#333333;">
                                Hi {{ $name }},
                            </p>

                            <p style="margin:8px 0 0; font-size:14px; line-height:1.7; color:#727272;">
                                Use the code below to finish signing in to UM-ERCH.
                            </p>

                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;">
                                <tr>
                                    <td bgcolor="#FFF4D9" style="background-color:#FFF4D9; border-radius:999px; padding:7px 16px; font-size:12px; font-weight:600; letter-spacing:.3px; line-height:1.5; color:#9C0306;">
                                        Code sent to {{ $maskedEmail }}
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0; background-color:#F6F6F6; border-radius:15px;">
                                <tr>
                                    <td align="center" style="padding:26px 16px;">
                                        <div style="font-size:38px; line-height:1; font-weight:700; letter-spacing:10px; text-indent:10px; color:#9C0306;">
                                            {{ $otp }}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:16px 0 0; font-size:12px; line-height:1.6; color:#9C9C9C;">
                                This code expires in 5 minutes. Do not share it with anyone.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="border-top:1px solid #E6E6E6; padding:18px 32px 24px; border-radius:0 0 16px 16px;">
                            <p style="margin:0; font-size:12px; line-height:1.6; color:#727272; text-align:center;">
                                If you did not request this code, you can safely ignore this email.
                            </p>
                            <p style="margin:10px 0 0; font-size:11px; line-height:1.6; color:#9C9C9C; text-align:center;">
                                Copyright &copy; 2025 UMerch | Powered by University of Mindanao
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
