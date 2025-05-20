//JS for login page
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    //Create http post request to api to login
    fetch('https://dummyjson.com/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    })
    .then(res => {
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    })
    .then(data => {
      // Save user information to localStorage
      localStorage.setItem('user', JSON.stringify(data));
      // Redirect to the main page
      window.location.href = 'index-35.html';
    })
    .catch(err => {
      alert("Login failed: " + err.message);
    });
  });