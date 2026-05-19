import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Received body:', JSON.stringify({ amount: body.amount, itemCount: body.items?.length, paymentMethod: body.paymentMethod }))

    const { amount, currency = 'INR', receipt, notes, shippingAddress, items, paymentMethod, customerEmail } = body

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!customerEmail || !emailRegex.test(String(customerEmail))) {
      console.error('Invalid or missing customer email:', customerEmail)
      return new Response(JSON.stringify({ error: 'Valid customer email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!amount || amount < 1) {
      console.error('Invalid amount:', amount)
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone) {
      console.error('Missing shipping address:', shippingAddress)
      return new Response(JSON.stringify({ error: 'Missing shipping address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header if present
    const authHeader = req.headers.get('Authorization')
    let userId = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    const trackingId = `HP${Date.now().toString(36).toUpperCase()}`
    const isCOD = paymentMethod === 'cod'

    let razorpayOrder: any = null

    if (!isCOD) {
      const keyId = Deno.env.get('RAZORPAY_KEY_ID')
      const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

      if (!keyId || !keySecret) {
        console.error('Missing Razorpay credentials')
        return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${keyId}:${keySecret}`),
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: notes || {},
        }),
      })

      if (!razorpayRes.ok) {
        const errData = await razorpayRes.text()
        console.error('Razorpay API error:', errData)
        return new Response(JSON.stringify({ error: 'Failed to create Razorpay order', details: errData }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      razorpayOrder = await razorpayRes.json()
      console.log('Razorpay order created:', razorpayOrder.id)
    }

    const orderData = {
      user_id: userId,
      tracking_id: trackingId,
      total: Math.round(amount),
      shipping: Math.round(shippingAddress.shipping || 0),
      full_name: shippingAddress.fullName,
      phone: shippingAddress.phone,
      address: shippingAddress.address || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      pincode: shippingAddress.pincode || '',
      razorpay_order_id: razorpayOrder?.id || null,
      payment_status: isCOD ? 'cod' : 'pending',
      status: 'processing',
    }

    console.log('Inserting order:', JSON.stringify({ trackingId, total: orderData.total, userId, isCOD }))

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Order insert error:', JSON.stringify(orderError))
      return new Response(JSON.stringify({ error: 'Failed to create order', details: orderError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.productId || null,
        name: item.name || 'Unknown Item',
        price: Math.round(item.price || 0),
        quantity: item.quantity || 1,
        color: item.color || null,
        size: item.size || null,
        image_url: item.image || null,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) {
        console.error('Order items insert error:', JSON.stringify(itemsError))
      }
    }

    console.log('Order created successfully:', order.id)

    if (isCOD) {
      return new Response(JSON.stringify({
        orderId: order.id,
        trackingId,
        paymentMethod: 'cod',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    return new Response(JSON.stringify({
      razorpayOrderId: razorpayOrder.id,
      orderId: order.id,
      trackingId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    }), {
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
