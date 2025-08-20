// Corrección del bug de validación
function validateEmail(email) {
    // BUG ORIGINAL: validación incorrecta
    // return email ? true : false; 

    // FIX: validación correcta con regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateForm(data) {
    if (!data.email || !validateEmail(data.email)) {
        return false;
    }
    return true;
}
