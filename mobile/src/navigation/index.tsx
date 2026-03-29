import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FolderOpen, Settings, User } from 'lucide-react-native';

import type { RootStackParamList, MainTabParamList } from './types';
import { AuthProvider, useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import PastProjectsScreen from '../screens/main/PastProjectsScreen';
import RateManagementScreen from '../screens/main/RateManagementScreen';
import MyAccountScreen from '../screens/main/MyAccountScreen';
import Step1ProjectDetailsScreen from '../screens/estimation/Step1ProjectDetailsScreen';
import Step2ImageCaptureScreen from '../screens/estimation/Step2ImageCaptureScreen';
import Step3AIAnalysisScreen from '../screens/estimation/Step3AIAnalysisScreen';
import Step4ManualVerificationScreen from '../screens/estimation/Step4ManualVerificationScreen';
import Step5CostEstimationScreen from '../screens/estimation/Step5CostEstimationScreen';
import BOQExportScreen from '../screens/estimation/BOQExportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 4,
          height: 62,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="PastProjects"
        component={PastProjectsScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <FolderOpen color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="RateManagement"
        component={RateManagementScreen}
        options={{
          tabBarLabel: 'Rates',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Settings color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={MyAccountScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <User color={color} size={size - 2} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Step1" component={Step1ProjectDetailsScreen} />
      <Stack.Screen name="Step2" component={Step2ImageCaptureScreen} />
      <Stack.Screen name="Step3" component={Step3AIAnalysisScreen} />
      <Stack.Screen name="Step4" component={Step4ManualVerificationScreen} />
      <Stack.Screen name="Step5" component={Step5CostEstimationScreen} />
      <Stack.Screen name="BOQ" component={BOQExportScreen} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
