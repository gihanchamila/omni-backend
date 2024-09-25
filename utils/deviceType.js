export const getDeviceType = (userAgent) => {
    if (/mobile/i.test(userAgent)) {
      return 'Mobile';
    } else if (/tablet/i.test(userAgent)) {
      return 'Tablet';
    } else {
      return 'Laptop'; // Assuming all other cases are laptops
    }
  };