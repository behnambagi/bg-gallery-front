import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user || action.payload.jeweler,
        isAuthenticated: true,
        isLoading: false,
        token: action.payload.accessToken,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            accessToken: token,
            user: userData
          }
        });
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (phoneNumber, otpCode) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.verifyOtp(phoneNumber, otpCode);
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user || response.jeweler));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const sendOtp = async (phoneNumber) => {
    return await authService.sendOtp(phoneNumber);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    logout,
    sendOtp,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};