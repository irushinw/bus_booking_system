import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: number | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: 'user' | 'driver' | 'admin' | null;
  isVerified: boolean;
  profileImage: string | null;
  dateOfBirth: string | null;
  address: string | null;
  emergencyContact: string | null;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
  };
  createdAt: string | null;
  updatedAt: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  phone: null,
  role: null,
  isVerified: false,
  profileImage: null,
  dateOfBirth: null,
  address: null,
  emergencyContact: null,
  preferences: {
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
  },
  createdAt: null,
  updatedAt: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      return action.payload;
    },
    clearUser() {
      return initialState;
    },
    updateUserProfile(state, action: PayloadAction<Partial<Omit<UserState, 'preferences'>>>) {
      return { ...state, ...action.payload };
    },
    updateUserPreferences(state, action: PayloadAction<Partial<UserState['preferences']>>) {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setUserRole(state, action: PayloadAction<UserState['role']>) {
      state.role = action.payload;
    },
    setUserVerification(state, action: PayloadAction<boolean>) {
      state.isVerified = action.payload;
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  updateUserProfile, 
  updateUserPreferences, 
  setUserRole, 
  setUserVerification 
} = userSlice.actions;
export default userSlice.reducer;