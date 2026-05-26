const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateOTP = (otp) => /^\d{6}$/.test(otp);

const validatePassword = (password) => password && password.length >= 8;

module.exports = { validateEmail, validateOTP, validatePassword };
