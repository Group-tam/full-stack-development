import { useState, useRef, useEffect } from "react";
import Navbar from "../components/navigation/Navbar";
import Sidebar from "../components/navigation/Sidebar";
import { useAppDispatch, useAppSelector } from "../hook/hooks";
import { toggle } from "../redux/components/sidebarSlice";
import AvatarUploader from "../components/AvatarUploader";
import { fetchCurrentUser } from "../redux/auth/authSlice";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { getInputStyles, ValidationState } from '../utils/validationStyles';
import { validatePassword, validatePasswordMatch } from '../utils/passwordValidator';
import { Tooltip } from '../components/Tooltip';
import { User } from "../dataTypes/type";

// FloatingLabelInput component
interface FloatingLabelInputProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete?: string;
  title?: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  type,
  value,
  onChange,
  label,
  disabled,
  className = "",
  onFocus,
  onBlur,
  autoComplete,
  title
}) => {
  // Generate unique ID for input-label association
  const inputId = useRef(`floating-input-${Math.random().toString(36).substr(2, 9)}`).current;

  return (
    <div className="relative">
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        disabled={disabled}
        className={`
          peer w-full p-2 pt-6 border rounded
          placeholder-transparent
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete={autoComplete}
        title={title}
      />
      <label
        htmlFor={inputId}
        className={`
          absolute left-2 top-4 text-gray-500
          transition-all duration-200
          cursor-text
          peer-placeholder-shown:text-base
          peer-placeholder-shown:top-4
          peer-focus:top-1
          peer-focus:text-xs
          peer-focus:text-blue-500
          ${value ? "top-1 text-xs" : ""}
          ${disabled ? "cursor-not-allowed" : ""}
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(state => state.sidebar.isOpen);
  const toggleSidebar = () => dispatch(toggle());
  const [isLoading, setIsLoading] = useState(true);
  const user = useAppSelector((state: { auth: { user: User | null } }) => state.auth.user);
  const [shouldUpdateAvatar, setShouldUpdateAvatar] = useState(false);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [avatar, setAvatar] = useState<string>("000000000000000000000000");
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState("/user/image/000000000000000000000000");

  // for editing
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [canEditPassword, setCanEditPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasDigit: false,
    hasSpecialChar: false
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  const getCurrentPasswordState = (): ValidationState => {
    if (!currentPassword) return 'neutral';
    return canEditPassword ? 'valid' : 'invalid';
  };

  const getNewPasswordState = (): ValidationState => {
    if (!newPassword) return 'neutral';
    if (newPassword && currentPassword && newPassword === currentPassword) return 'invalid';
    return passwordValidation.isValid ? 'valid' : 'invalid';
  };

  const getConfirmPasswordState = (): ValidationState => {
    if (!confirmPassword) return 'neutral';
    return validatePasswordMatch(newPassword, confirmPassword) ? 'valid' : 'invalid';
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!newUsername || newUsername === user?.username) {
        setUsernameError("");
        return;
      }
      fetch(`/user/search?query=${encodeURIComponent(newUsername)}`)
        .then(res => res.json())
        .then((data: User[]) => {
          if (data.some((u) => u.username === newUsername)) {
            setUsernameError("Username has already been taken");
          } else {
            setUsernameError("");
          }
        })
    }, 300); // 300ms debounce
  };

  // Check current password before enabling new password fields

  const handleCurrentPasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setCurrentPassword(password);
    
    if (!password) {
      setCanEditPassword(false);
      return;
    }
  
    const res = await fetch("/user/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    setCanEditPassword(res.ok);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordValidation(validatePassword(value));
  };

  // Handle avatar upload and zoom
  const handleAvatarUpload = (imageId: string) => {
    setAvatar(imageId);
    setAvatarPreview(`/user/image/${imageId}`);
  };

  // Fetch user data and initialize states
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await dispatch(fetchCurrentUser());
      setIsLoading(false);
    };
    initializeData();
  }, [dispatch]);

  // Update states when user data is available
  useEffect(() => {
    if (user) {
      setAvatar(user.avatar || "000000000000000000000000");
      setAvatarZoom(user.avatarZoom || 1);
      setAvatarPreview(`/user/image/${user.avatar || "000000000000000000000000"}`);
    }
  }, [user]);

  useEffect(() => {
    if (user?.username) {
      setUsername(""); 
    }
  }, [user]);

  // Save changes
  const handleSave = async () => {    // Username update
    if (username && username !== user?.username && !usernameError) {
      const res = await fetch("/user/update/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      if (!res.ok) {
        setUsernameError("Please enter a different username");
        return;
      }
    }
    // Password update
    if (canEditPassword && newPassword && newPassword === confirmPassword) {
      await fetch("/user/update/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    }
    // Avatar update
    if (shouldUpdateAvatar && (avatar && (avatar !== user?.avatar || avatarZoom !== user?.avatarZoom))) {
      await fetch("/user/update/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          avatar, 
          avatarZoom 
        }),
      });
      // Refresh user data after update
      dispatch(fetchCurrentUser());
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Please log in to access account settings</div>
      </div>
    );
  }

  const disabled=(
    !!usernameError || username === user?.username ||
    (currentPassword && (
      !canEditPassword ||
      (newPassword && !passwordValidation.isValid) ||
      (newPassword !== confirmPassword)
    ) ||
    (shouldUpdateAvatar && !avatar))
  )
  return (
    <div>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`mt-20 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-8'}`}>
        <div className="p-8 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
          <form autoComplete="off">
          {/* Username */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Username
            <Tooltip content="Leave this blank to keep your current username" direction="right">
            <span className="cursor-help text-gray-500 text-lg">❓</span>
            </Tooltip>
            </label>
            <div className="text-sm text-gray-500 mb-1">
           Current: <span className="font-mono">{user?.username}</span>
            </div>
            <input
              className="w-full p-2 border rounded"
              name="new-text"
              value={username}
              onChange={handleUsernameChange}
              autoComplete="new-text"
            />
            {username === user?.username && username !== "" ? (
              <div className="mt-2 p-2 bg-yellow-100 text-yellow-700 rounded">
                This is your current username!
              </div>
            ) : usernameError && (
              <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                {usernameError}
              </div>
            )}
          </div>
  {/* Password Section */}
  <div className="mb-6">
      <label className="block font-medium mb-2">Change Password</label>
      
      {/* Current Password */}
      <div className="relative mb-4">
        <FloatingLabelInput
          type={showCurrentPassword ? "text" : "password"}
          value={currentPassword}
          onChange={handleCurrentPasswordChange}
          label={  <span className="flex items-center gap-1">
            Current Password
            <Tooltip 
              content="Leave this blank or type in your current password to keep your current password"
              direction="right"
            >
              <span className="cursor-help text-gray-500 text-sm">❓</span>
            </Tooltip>
          </span>}
          className={getInputStyles(getCurrentPasswordState())}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
        >
          {showCurrentPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* New Password */}
      <div className="relative mb-4">
        <FloatingLabelInput
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={handleNewPasswordChange}
          label="New Password"
          disabled={!canEditPassword}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          className={getInputStyles(getNewPasswordState())}
          autoComplete="new-password"
          title={!canEditPassword ? "Please verify your current password first" : ""}
        />
        {canEditPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Password Requirements */}
      {isPasswordFocused && (
        <div className="mt-2 mb-4 text-sm space-y-1">

          {newPassword && currentPassword && newPassword === currentPassword && ( 
          <p className="text-red-600 font-semibold">
            ⚠️ New password must be different from current password
          </p>
           )}
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className={passwordValidation.hasMinLength ? 'text-green-600' : (newPassword ? 'text-red-600' : 'text-gray-600')}>
              ✓ At least 10 characters
            </p>
            <p className={passwordValidation.hasUppercase ? 'text-green-600' : (newPassword ? 'text-red-600' : 'text-gray-600')}>
              ✓ Contains uppercase letter
            </p>
            <p className={passwordValidation.hasLowercase ? 'text-green-600' : (newPassword ? 'text-red-600' : 'text-gray-600')}>
              ✓ Contains lowercase letter
            </p>
            <p className={passwordValidation.hasDigit ? 'text-green-600' : (newPassword ? 'text-red-600' : 'text-gray-600')}>
              ✓ Contains at least one digit
            </p>
            <p className={passwordValidation.hasSpecialChar ? 'text-green-600' : (newPassword ? 'text-red-600' : 'text-gray-600')}>
              ✓ Contains special character
            </p>
          </div>
        </div>
      )}

      {/* Confirm Password */}
      <div className="relative">
        <FloatingLabelInput
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Confirm New Password"
          disabled={!canEditPassword}
          className={getInputStyles(getConfirmPasswordState())}
          autoComplete="new-password"
          title={!canEditPassword ? "Please verify your current password first" : ""}
        />
        {canEditPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Confirm Password Message */}
      {confirmPassword && (
        <p className={`mt-2 text-sm ${
          validatePasswordMatch(newPassword, confirmPassword) ? 'text-green-600' : 'text-red-600'
        }`}>
          {validatePasswordMatch(newPassword, confirmPassword) 
            ? '✓ Passwords match' 
            : '✗ Passwords do not match'}
        </p>
      )}
    </div>
          {/* Avatar */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Profile Picture</label>
            <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={shouldUpdateAvatar}
              onChange={(e) => setShouldUpdateAvatar(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Change avatar</span>
          </div>
          {shouldUpdateAvatar && (
            <AvatarUploader
              onAvatarUpload={handleAvatarUpload}
              defaultAvatarUrl={avatarPreview}
              defaultAvatarId="000000000000000000000000"
              initialZoom={avatarZoom}
              onZoomChange={setAvatarZoom}
            />
          )}
          </div>
          {/* Save Button */}
          <button
             className={`w-full py-2 rounded transition ${
              disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={handleSave}
            disabled={disabled}     
          >
            Save Changes
          </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}