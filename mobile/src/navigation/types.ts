import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Step1: undefined;
  Step2: { projectId: string };
  Step3: { projectId: string };
  Step4: { projectId: string };
  Step5: { projectId: string };
  BOQ: { projectId: string };
};

export type MainTabParamList = {
  Home: undefined;
  PastProjects: undefined;
  RateManagement: undefined;
  Account: undefined;
};
