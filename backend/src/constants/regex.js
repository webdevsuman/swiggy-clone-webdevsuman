const regex = {
  // At least 1 lowercase, 1 uppercase, 1 digit, 1 special char, min 6 chars
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
  mongoId: /^[0-9a-fA-F]{24}$/,
  phone: /^[0-9]{10}$/,
};

export default regex;
