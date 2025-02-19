/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Qtm2SQpfiriABRT7jvSVucmbZ0UOKzGf4yqB0NOtys33MTUcc0T9Papvr988DM0bLbJ12KQ2Xnj9TgetUKjVuV600PvliqBEJ',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3030/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

