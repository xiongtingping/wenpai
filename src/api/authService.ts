/**
 * Authentication and SMS verification service
 * Handles user authentication, registration and SMS verification
 */

// SMS verification API key
const SMS_API_KEY = 'ZboG6kimhLN7CkrS3nbDqjCIaU2FZdML';

export interface VerificationResult {
  success: boolean;
  message: string;
  verificationId?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

/**
 * Send SMS verification code to the user's phone
 * @param phone User's phone number
 * @returns Promise with verification result
 */
export async function sendVerificationCode(phone: string): Promise<VerificationResult> {
  try {
    console.log(`Sending verification code to ${phone} using API key: ${SMS_API_KEY.substring(0, 5)}...`);
    
    // Simulate API call with a delay
    // In production, this would be an actual API call to your SMS provider
    return new Promise((resolve) => {
      setTimeout(() => {
        if (phone && phone.length >= 10) {
          resolve({
            success: true,
            message: "验证码发送成功，请查收短信",
            verificationId: generateRandomId()
          });
        } else {
          resolve({
            success: false,
            message: "手机号格式不正确，请输入有效的手机号"
          });
        }
      }, 1000);
    });
    
    // Example of actual API call in production:
    /*
    const response = await fetch('https://api.smsservice.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_API_KEY}`
      },
      body: JSON.stringify({
        phone: phone,
        template: 'verification'
      })
    });
    
    if (!response.ok) {
      throw new Error(`SMS API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: data.success,
      message: data.message,
      verificationId: data.verificationId
    };
    */
  } catch (error) {
    console.error('SMS verification failed:', error);
    return {
      success: false,
      message: "短信验证码发送失败，请稍后重试"
    };
  }
}

/**
 * Verify SMS code entered by the user
 * @param verificationId ID from the sendVerificationCode response
 * @param code SMS code entered by the user
 * @returns Promise with verification result
 */
export async function verifyCode(verificationId: string, code: string): Promise<VerificationResult> {
  try {
    console.log(`Verifying code ${code} for ID ${verificationId}`);
    
    // Simulate API call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, accept any 6-digit code
        if (code && code.length === 6 && /^\d+$/.test(code)) {
          resolve({
            success: true,
            message: "验证码验证成功"
          });
        } else {
          resolve({
            success: false,
            message: "验证码不正确，请重新输入"
          });
        }
      }, 1000);
    });
    
    // Example of actual API call in production:
    /*
    const response = await fetch('https://api.smsservice.com/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_API_KEY}`
      },
      body: JSON.stringify({
        verificationId: verificationId,
        code: code
      })
    });
    
    if (!response.ok) {
      throw new Error(`Verification API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: data.success,
      message: data.message
    };
    */
  } catch (error) {
    console.error('Code verification failed:', error);
    return {
      success: false,
      message: "验证失败，请稍后重试"
    };
  }
}

/**
 * Register a new user with verified phone
 * @param userData User registration data
 * @returns Promise with auth result
 */
export async function registerUser(userData: {
  name: string;
  phone: string;
  email: string;
  password: string;
  verificationId: string;
}): Promise<AuthResult> {
  try {
    console.log(`Registering user ${userData.name} with phone ${userData.phone}`);
    
    // Simulate API call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "注册成功",
          token: `token_${generateRandomId()}`,
          user: {
            id: generateRandomId(),
            name: userData.name,
            phone: userData.phone,
            email: userData.email
          }
        });
      }, 1500);
    });
    
    // Example of actual API call in production:
    /*
    const response = await fetch('https://api.yourservice.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`Registration API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: data.success,
      message: data.message,
      token: data.token,
      user: data.user
    };
    */
  } catch (error) {
    console.error('User registration failed:', error);
    return {
      success: false,
      message: "注册失败，请稍后重试"
    };
  }
}

/**
 * Generate random ID for demo purposes
 * @returns Random ID string
 */
function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}