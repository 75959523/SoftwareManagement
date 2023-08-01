
        function handleSubmit(event) {
            event.preventDefault(); // Prevent the form from submitting normally

            // Get the form data
            const form = event.target;
            const formData = new FormData(form);

            // Send a POST request using AJAX
            fetch(form.action, {
                method: "POST",
                body: formData,
            })
            .then((response) => {
                if (response.ok) {
                    // If the response is successful, get the entered username and redirect to a new page with the username in the URL
                    const username = formData.get('username');
                    window.location.href = `/index.html?username=${encodeURIComponent(username)}`;
                } else {
                    // If the response is not successful, display the error message
                    response.json().then((data) => {
                        const errorMessage = data.message; // Assuming your backend returns the error message as "message"
                        const errorMessageContainer = document.getElementById("error-message");
                        errorMessageContainer.textContent = errorMessage;
                    });
                }
            })
            .catch((error) => {
                // Handle any errors that occur during the fetch
                console.error("Error:", error);
            });
        }

        // Add event listener to the form
        const loginForm = document.getElementById("login-form");
        loginForm.addEventListener("submit", handleSubmit);