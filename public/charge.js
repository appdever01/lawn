
    const stripe = Stripe(stripePublickey)
    
    const elements = stripe.elements();
    
    const cardElement = stripe.elements().create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
        },
      },
    });
    
    cardElement.mount('#card-element');
    
    const form = document.getElementById('payment-form');

    // on submit
    form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const { token, error } = await stripe.createToken(cardElement);
    
    if (error) {
      const errorElement = document.getElementById('card-errors');
      errorElement.textContent = error.message;
    } else {
      const hiddenInput = document.createElement('input');
      hiddenInput.setAttribute('type', 'hidden');
      hiddenInput.setAttribute('name', 'token');
      hiddenInput.setAttribute('value', token.id);
    
      form.appendChild(hiddenInput);
      form.submit();
    }
    });
    
    

