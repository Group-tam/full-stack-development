import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { validatePassword, PasswordValidation, validatePasswordMatch } from '../utils/passwordValidator';
import { getInputStyles, ValidationState } from '../utils/validationStyles';
import {Link} from "react-router-dom";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const [Name, setName] = useState('');
    const [email, setEmail] = useState('');
     
    // New password validation states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
        isValid: false,
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasDigit: false,
        hasSpecialChar: false,
    });
    const [isPasswordMatch, setIsPasswordMatch] = useState(false); 
    const [errorMessage, setErrorMessage] = useState('');
 // Password validation handler
 const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValidation(validatePassword(newPassword));
};
  // Confirm password handler
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
};

    // Check password match
    useEffect(() => {
        setIsPasswordMatch(validatePasswordMatch(password, confirmPassword));
    }, [password, confirmPassword]);
    
    // Get validation states
    const getPasswordValidationState = (): ValidationState => {
        if (password === '') return 'neutral';
        return passwordValidation.isValid ? 'valid' : 'invalid';
    };
    
    const getConfirmPasswordValidationState = (): ValidationState => {
        if (confirmPassword === '') return 'neutral';
        return isPasswordMatch ? 'valid' : 'invalid';
    };
 
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage('');
    
      // Validate required fields
      if (!Name) {
        setErrorMessage("Username is required");
        return;
      }
    
      {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
          setErrorMessage("Please enter a properly formatted email address");
          return;
        }
    }

      const username = `${Name}`.trim();
      console.log("SSET")
      console.log("Submitting:", { username, email }); // Log request data
      
      try {
        const response = await fetch('/user', {
          method: 'POST',
          headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json'},
          body: JSON.stringify({
            username,
            password,
            email,  // Match backend schema
          }),
        });
        console.log("Response:", response); // Log response
        if (!response.ok) {
          const errorText = await response.json();
          setErrorMessage(errorText.error || "Registration failed");
          return;
        }
    
        window.location.href = '/login';
      } catch (error) {
        setErrorMessage("Network error. Please try again.");
        console.error('Registration error:', error);
      }
    };




    return (
      <div className="min-h-screen bg-amber-100 flex flex-col items-center justify-center p-4">
        {/* Main Card */}
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create an account...
          </h1>
  
          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. John"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
  
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
   
     {/* Password Field */}
     <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className={getInputStyles(getPasswordValidationState())}
                        placeholder="••••••••"
                        value={password}
                        onChange={handlePasswordChange}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                </div>

                {/* Validation Requirements */}
                {isPasswordFocused && (
                    <div className="mt-2 text-sm space-y-1">
                        <p className={passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-600'}>
                            ✓ At least 10 characters
                        </p>
                        <p className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-600'}>
                            ✓ Contains uppercase letter
                        </p>
                        <p className={passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-600'}>
                            ✓ Contains lowercase letter
                        </p>
                        <p className={passwordValidation.hasDigit ? 'text-green-600' : 'text-gray-600'}>
                            ✓ Contains at least one digit
                        </p>
                        <p className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-600'}>
                            ✓ Contains special character
                        </p>
                    </div>
                )}
            </div>
      {/* Re-enter Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Re-enter Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className={getInputStyles(getConfirmPasswordValidationState())}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onFocus={() => setIsConfirmPasswordFocused(true)}
            onBlur={() => setIsConfirmPasswordFocused(false)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
     {/* Confirm Password Validation */}
     {isConfirmPasswordFocused && confirmPassword !== '' && (
                            <p className={`mt-2 text-sm ${
                                isPasswordMatch ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {isPasswordMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </p>
                        )}
     {/* Error message display */}
        {errorMessage && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {errorMessage}
                        </div>
                    )}
      {/* Terms Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className="rounded text-blue-600 focus:ring-blue-500"
          checked={isTermsAccepted}
          onChange={(e) => setIsTermsAccepted(e.target.checked)}
        />
              <span className="text-sm text-gray-600">
                By creating our account, I agree to <span className="font-semibold">SeroMeet</span>
                <b> <u>Terms of use and Privacy Policy</u></b>
              </span>
            </div>
  
         
      {/* Register Button */}
      <button
        type="submit"
        disabled={!isTermsAccepted || !passwordValidation.isValid || !isPasswordMatch}
        className={`w-full text-white py-2 px-4 rounded-md transition-colors ${
          (isTermsAccepted && passwordValidation.isValid && isPasswordMatch)
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Register account
      </button>

          </form>
  
          {/* Existing User Section */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Already sign up? Then log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

