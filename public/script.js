document.addEventListener('htmx:afterSwap', function (event) {
     if (event.detail.target.id === 'response' && event.detail.trigger === 'login-form') {
          var newContent = event.detail.swapped.innerHTML;
          if (newContent.includes("Login successful")) {
               // Redirect to dashboard after successful login
               window.location.href = '/dashboard';
          }
     }
});
