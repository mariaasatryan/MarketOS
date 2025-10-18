// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавную букву');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчную букву');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать цифру');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const validateUrl = (url: string): boolean => {
  if (!url || url.trim().length === 0) {
    return false;
  }
  
  try {
    // Добавляем протокол если его нет
    let urlToValidate = url.trim();
    if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://') && !urlToValidate.startsWith('ftp://')) {
      urlToValidate = 'https://' + urlToValidate;
    }
    
    new URL(urlToValidate);
    return true;
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  if (!url || url.trim().length === 0) {
    return '';
  }
  
  let normalizedUrl = url.trim();
  
  // Добавляем протокол если его нет
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://') && !normalizedUrl.startsWith('ftp://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  
  return normalizedUrl;
};

export const validateApiKey = (apiKey: string): boolean => {
  // Basic API key validation - should be non-empty and not contain spaces
  return apiKey.trim().length > 0 && !apiKey.includes(' ');
};
