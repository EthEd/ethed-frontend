import { sendMail } from "@/lib/mailer";

interface CourseCompletionEmailProps {
  to: string;
  userName: string;
  courseName: string;
  courseSlug: string;
  xpAwarded: number;
}

export async function sendCourseCompletionEmail({
  to,
  userName,
  courseName,
  courseSlug,
  xpAwarded,
}: CourseCompletionEmailProps) {
  const siteUrl = process.env.NEXTAUTH_URL ?? "https://ethed.xyz";
  const dashboardUrl = `${siteUrl}/dashboard`;
  const learnUrl = `${siteUrl}/learn/${courseSlug}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Course Complete 🎉</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0891b2,#3b82f6);padding:40px 40px 32px;text-align:center;">
              <div style="font-size:40px;margin-bottom:12px;">🎓</div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Course Complete!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">You've levelled up your Web3 knowledge.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;color:#94a3b8;font-size:15px;">Hi <strong style="color:#e2e8f0;">${userName}</strong>,</p>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                You just completed <strong style="color:#22d3ee;">${courseName}</strong> — that&rsquo;s a huge milestone. Every expert was once a beginner, and you&rsquo;re well on your way.
              </p>

              <!-- XP card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">XP Earned</p>
                    <p style="margin:0;color:#22d3ee;font-size:32px;font-weight:800;">+${xpAwarded} XP</p>
                    <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Added to your learner profile</p>
                  </td>
                </tr>
              </table>

              <!-- What's next -->
              <p style="margin:0 0 12px;color:#e2e8f0;font-size:15px;font-weight:600;">What&rsquo;s next?</p>
              <ul style="margin:0 0 28px;padding-left:20px;color:#94a3b8;font-size:14px;line-height:1.8;">
                <li>Claim your <strong style="color:#a78bfa;">NFT achievement badge</strong> from your dashboard</li>
                <li>Continue your streak — keep the momentum going</li>
                <li>Explore the next course on your learning path</li>
              </ul>

              <!-- CTA buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:8px;" width="50%">
                    <a href="${dashboardUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#0891b2,#3b82f6);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 20px;border-radius:10px;">
                      View Dashboard
                    </a>
                  </td>
                  <td style="padding-left:8px;" width="50%">
                    <a href="${learnUrl}" style="display:block;text-align:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:10px;">
                      Review Course
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.06);padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                You&rsquo;re receiving this because you completed a course on
                <a href="${siteUrl}" style="color:#0891b2;text-decoration:none;"> EthEd</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hi ${userName},\n\nCongratulations! You completed "${courseName}" and earned +${xpAwarded} XP.\n\nClaim your NFT badge and keep learning:\n${dashboardUrl}\n\n— The EthEd Team`;

  return sendMail({
    to,
    subject: `🎓 You completed "${courseName}" — +${xpAwarded} XP earned!`,
    html,
    text,
  });
}
