const form = document.querySelector("#login-form")
const errorMessage = document.querySelector("#error-message")
const loginElement = document.querySelector(".login")
const logoutElement = document.querySelector(".logout")
function onsubmit(e){
    e.preventDefault()
    const email = form.querySelector("#email").value
    const password = form.querySelector("#password").value
    login(email,password)

    
}
async function login(email,password){
    const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email, 
            password: password, 
        }),
    });

    
    if (response.ok) {
        const data = await response.json(); 

        
        console.log('Connexion réussie', data);

        
        localStorage.setItem("token", data.token);

        
        window.location.href = "index.html"; 
    } else {
        const errorData = await response.json(); 
        console.error("Erreur de connexion:", errorData);
       
        showError(errorData.message || "Une erreur est survenue lors de la connexion.");
    }

    
function showError(message) {
    const errorMessage = document.querySelector("#error-message"); 
    errorMessage.textContent = message; 
    errorMessage.classList.remove("hidden"); 
        
        setTimeout(() => {
            errorMessage.classList.add("hidden");
        }, 5000);
    }
}
form.addEventListener("submit",onsubmit)

function isConnected(){
    const token = localStorage.getItem("token")
    
    return !!token     
}

if (isConnected()){
    
    loginElement.classList.add("hidden")
    logoutElement.classList.remove("hidden")


}
function logout (){
    localStorage.removeItem("token")
}

logoutElement.addEventListener("click",logout)



