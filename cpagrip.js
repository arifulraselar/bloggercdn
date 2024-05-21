
const serverURL = "http://localhost:3000"
const content = document.getElementById('app');

document.addEventListener('DOMContentLoaded', function() {
    
// Routes and their corresponding content
const routes = {
  '/admin': `
    <div class="container" id="data_Content" style="display: none;">
    <p>Admin Data</p>
    <span id="update" style="display: none; padding: 5px; color: green;">Update sucess</span>
    <br>
    <span>Survay URL</span>
    <input type="text" id="survay_url" placeholder="Enter Your survay URL">
    <span>Pcode secret key</span>
    <input type="text" id="secret_key" placeholder="enter your pcode secret key">
    <span>Redirect URL key</span>
    <input type="text" id="redirect_url_key" placeholder="Enter redirect URL key">
    <span>Redirect URL</span>
    <input type="text" id="redirect_url" value="" disabled>
    <button onclick="submitData()">Submit</button>
</div>
<div class="container" id="login_content">
    <p>Login Admin</p>
    
    <span>Username</span>
    <input type="text" id="username" placeholder="Enter Your username">
    <span>Password</span>
    <input type="text" id="pass" placeholder="enter your password">
    <button onclick="userLogin()">Login</button>
</div>
 `,
'/contact': '<h1>Contact Page</h1><p>Get in touch through this page.</p>'
    };

   // Function to handle navigation
    function navigate(event) {
        event.preventDefault();
        const path = event.target.getAttribute('href');
        window.history.pushState({}, path, window.location.origin + path);
        handleRoute();
    };

      // Function to parse query parameters
      function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split("&");
        pairs.forEach(pair => {
            const [key, value] = pair.split("=");
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return params;
    };
   
    // Function to handle route changes
    function handleRoute() {
        const path = window.location.pathname;
        if (path === '/') {
            // Get query parameters
            const queryParams = getQueryParams();
            const job = queryParams.job;
            const worker = queryParams.worker;
            // Construct the identity
            if (job && worker) {
                const identity = job + worker;
                localStorage.setItem('identity', identity);
                console.log(identity)
                // Call the server-side endpoint
                fetch(`${serverURL}/?job=${job}&worker=${worker}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.redirect) {
                            //window.location.href = data.redirect;
                        } else {
                            content.innerHTML = data.message;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        content.innerHTML = 'Error loading content.';
                    });
            } else {
                content.innerHTML = '<h1>Invalid job or worker parameter.</h1>';
            }
        } 
        else if(path === '/pcode') {
            getPcodes();
        }
        else{
            content.innerHTML = routes[path] || '<h1>404 - Page Not Found</h1>';
        }
    };

    // Add event listeners to navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', navigate);
    });

    // Listen for popstate events (back/forward browser buttons)
    window.addEventListener('popstate', handleRoute);

    // Trigger the function on page load
    handleRoute();
});







    const pcodeurl = `${window.location.protocol}//${window.location.hostname}/pcode?key=`;
    function userLogin(){
    var username = document.getElementById("username").value;
    var pass = document.getElementById("pass").value;
    
    fetch(`${serverURL}/admin-login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({username:username, pass: pass})
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then(data => {
                    document.getElementById("data_Content").style.display = "block";
                    document.getElementById("login_content").style.display = "none";
    
                    document.getElementById("survay_url").value = data.survay_url?data.survay_url:"";
                    document.getElementById("secret_key").value = data.secret_key?data.secret_key:"";
                    document.getElementById("redirect_url_key").value = data.redirect_url_key?data.redirect_url_key:"";
                   document.getElementById("redirect_url").value = data.redirect_url_key?`${pcodeurl}${data.redirect_url_key}`:"";
              })
              .catch(error => {
                alert("You are not Admin")
                console.error('Fetch error:', error);
              });
              
    };
    
    
    function submitData(){
    var survay_url = document.getElementById("survay_url").value;
    var secret_key = document.getElementById("secret_key").value;
    var redirect_url_key = document.getElementById("redirect_url_key").value;
    var redirect_url = document.getElementById("redirect_url").value;
    
    fetch(`${serverURL}/admin-update`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({survay_url: survay_url, secret_key: secret_key, redirect_url_key:redirect_url_key})
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then(data => {
                
                    document.getElementById("update").style.display = "block";
                    document.getElementById("redirect_url").value = `${pcodeurl}${redirect_url_key}`;
               
              })
              .catch(error => {
                console.error('Fetch error:', error);
              });
              
    };
       








function getPcodes(){
        const urlParams = new URLSearchParams(window.location.search);
        const verify_key = urlParams.get("key");
        const identity = localStorage.getItem('identity');
        console.log(identity);
        if(identity&&verify_key){
        fetch( `${serverURL}/pcode-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({identity:identity, verify_key: verify_key})
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
               console.log(data)
               content.innerHTML = ` <div class="container" style="display: flex;" id="pcode_Content">
        <p style="color: green; font-weight: bold;">Congregation</p>
        <span id="pcode">${data.pcode}</span>
    </div>`
                
           
          })
          .catch(error => {
            content.innerHTML = ("Work not complite");
            console.log('Fetch error:', error);
          });
        }

        else{
            content.innerHTML = ("Wrong Url");
        };
}
