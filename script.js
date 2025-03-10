     // Get DOM elements
     const getJokeButton = document.getElementById('get-joke');
     const jokeText = document.getElementById('joke-text');
     const jokeDelivery = document.getElementById('joke-delivery');
     const jokeMeta = document.getElementById('joke-meta');
     const loader = document.getElementById('loader');
     const errorMessage = document.getElementById('error-message');
     
     // Get joke from API using XMLHttpRequest
     function getJoke() {
         // Show loader, hide error message
         loader.style.display = 'block';
         errorMessage.style.display = 'none';
         jokeText.style.display = 'none';
         jokeDelivery.style.display = 'none';
         jokeDelivery.style.opacity = '0';
         jokeMeta.innerHTML = '';
         
         // Get filter values
         const category = document.getElementById('category').value;
         const type = document.getElementById('type').value;
         const language = document.getElementById('language').value;
         
         // Get blacklist flags
         const blacklistFlags = [];
         document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
             blacklistFlags.push(checkbox.value);
         });
         
         // Build URL
         let url = `https://v2.jokeapi.dev/joke/${category}`;
         
         // Add parameters
         const params = [];
         if (type !== 'any') {
             params.push(`type=${type}`);
         }
         if (language) {
             params.push(`lang=${language}`);
         }
         if (blacklistFlags.length > 0) {
             params.push(`blacklistFlags=${blacklistFlags.join(',')}`);
         }
         
         // Add safe mode if any blacklist flags are checked
         if (blacklistFlags.length > 0) {
             params.push('safe-mode');
         }
         
         if (params.length > 0) {
             url += `?${params.join('&')}`;
         }
         
         // Create and send XMLHttpRequest
         const xhr = new XMLHttpRequest();
         xhr.open('GET', url, true);
         
         xhr.onreadystatechange = function() {
             if (xhr.readyState === 4) {
                 loader.style.display = 'none';
                 
                 if (xhr.status === 200) {
                     try {
                         const response = JSON.parse(xhr.responseText);
                         
                         if (response.error) {
                             // Show error message
                             errorMessage.style.display = 'block';
                             errorMessage.textContent = response.message || 'An error occurred. Try again.';
                             return;
                         }
                         
                         // Display joke
                         displayJoke(response);
                     } catch (e) {
                         console.error('Error parsing response:', e);
                         errorMessage.style.display = 'block';
                         errorMessage.textContent = 'Error parsing response from server.';
                     }
                 } else {
                     // Show error message
                     errorMessage.style.display = 'block';
                     errorMessage.textContent = `Error: ${xhr.status} - ${xhr.statusText || 'Unknown error'}`;
                 }
             }
         };
         
         xhr.send();
     }
     
     // Display joke in DOM
     function displayJoke(joke) {
         jokeText.style.display = 'block';
         
         if (joke.type === 'single') {
             jokeText.textContent = joke.joke;
             jokeDelivery.style.display = 'none';
         } else if (joke.type === 'twopart') {
             jokeText.textContent = joke.setup;
             jokeDelivery.textContent = joke.delivery;
             jokeDelivery.style.display = 'block';
             
             // Reveal punchline after 2 seconds
             setTimeout(() => {
                 jokeDelivery.style.opacity = '1';
             }, 2000);
         }
         
         // Display meta information
         const flagNames = [];
         for (const [flag, value] of Object.entries(joke.flags)) {
             if (value) {
                 flagNames.push(flag.charAt(0).toUpperCase() + flag.slice(1));
             }
         }
         
         jokeMeta.innerHTML = `
             <span>Category: ${joke.category}</span>
             <span>ID: ${joke.id}</span>
             ${flagNames.length > 0 ? `<span>Flags: ${flagNames.join(', ')}</span>` : ''}
         `;
     }
     
     // Add event listener to button
     getJokeButton.addEventListener('click', getJoke);
     
     // Get initial joke on page load
     window.addEventListener('load', () => {
         // Optional: Get a joke automatically when page loads
         // getJoke();
     });