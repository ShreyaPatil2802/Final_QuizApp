window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('home').style.display = 'flex';
    }, 4000);
};

function navigate(role) {
    if (role === 'admin') {
        window.location.href = 'admin-login.html';
    } else if (role === 'user') {
        window.location.href = 'login.html';
    }
}
