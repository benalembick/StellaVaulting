import { loadStripe } from '@stripe/stripe-js'

let stripePromise = null

export function getStripe() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.warn('Missing VITE_STRIPE_PUBLISHABLE_KEY. Stripe checkout will not work.')
      return null
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

export async function redirectToCheckout(lineItems, customerEmail, successUrl, cancelUrl, metadata = {}) {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.')
  }

  const { error } = await stripe.redirectToCheckout({
    lineItems,
    mode: 'payment',
    successUrl: successUrl || `${window.location.origin}/checkout/success`,
    cancelUrl: cancelUrl || `${window.location.origin}/fundraising`,
    customerEmail,
    clientReferenceId: metadata.orderId,
  })

  if (error) throw error
}
