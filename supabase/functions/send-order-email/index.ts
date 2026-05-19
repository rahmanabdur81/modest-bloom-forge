import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string | null
}

interface OrderEmailBody {
  email: string
  name: string
  orderId: string
  total: number | string
  items?: OrderItem[]
  paymentStatus?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json()) as Partial<OrderEmailBody>
    const { email, name, orderId, total } = body

    if (!email || !name || !orderId || total === undefined || total === null) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, name, orderId, total' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const totalFormatted =
      typeof total === 'number'
        ? `₹${total.toLocaleString('en-IN')}`
        : `₹${total}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Order Confirmation</title>
        </head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
                  <tr>
                    <td style="background:#1a9e8e;padding:28px 32px;color:#ffffff;">
                      <h1 style="margin:0;font-size:22px;font-weight:700;">Habeeb's Paradise</h1>
                      <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Order Confirmation</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <h2 style="margin:0 0 12px;font-size:20px;">Thank you, ${escapeHtml(name)}!</h2>
                      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#555;">
                        We've received your order and it's being processed. Here are your order details:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;border-radius:8px;padding:20px;margin:0 0 20px;">
                        <tr>
                          <td style="padding:8px 0;color:#777;font-size:14px;">Order ID</td>
                          <td align="right" style="padding:8px 0;font-weight:600;font-size:14px;">${escapeHtml(orderId)}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#777;font-size:14px;">Total</td>
                          <td align="right" style="padding:8px 0;font-weight:700;font-size:16px;color:#1a9e8e;">${escapeHtml(totalFormatted)}</td>
                        </tr>
                      </table>
                      <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.6;">
                        We'll send you another email once your order ships.
                      </p>
                      <p style="margin:24px 0 0;font-size:13px;color:#999;">
                        If you have any questions, simply reply to this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0f0f0f;color:#aaa;padding:18px 32px;font-size:12px;text-align:center;">
                      © ${new Date().getFullYear()} Habeeb's Paradise. All rights reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Habeeb\'s Paradise <onboarding@resend.dev>',
        to: [email],
        subject: `Order Confirmation - ${orderId}`,
        html,
      }),
    })

    const data = await resendRes.json()

    if (!resendRes.ok) {
      console.error('Resend API error:', resendRes.status, JSON.stringify(data))
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    console.log('Order confirmation email sent:', data?.id, 'order:', orderId)

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
