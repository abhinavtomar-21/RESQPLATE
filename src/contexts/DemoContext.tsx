import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  IS_DEMO_MODE_CONFIGURED, 
  DEMO_RESTAURANT_USER,
  DEMO_NGO_USER,
  DEMO_VOLUNTEER_USER,
  DEMO_ADMIN_USER,
  INITIAL_DEMO_METRICS, 
  INITIAL_DEMO_DONATION, 
  DemoDonationItem 
} from '../config/demoConfig';
import { User } from './AuthContext';

export type DemoFlowStep = 'overview' | 'create' | 'ai_analysis' | 'human_verify' | 'ngo_match' | 'pickup' | 'impact' | 'profile';
export type DemoRole = 'Restaurant' | 'NGO' | 'Volunteer' | 'Admin';
export type DemoAccountType = 'admin' | 'restaurant' | 'ngo' | 'volunteer';

interface DemoContextType {
  isDemoActive: boolean;
  activeDemoAccount: DemoAccountType | null;
  activeUser: User;
  activeRole: DemoRole;
  flowStep: DemoFlowStep;
  demoMetrics: typeof INITIAL_DEMO_METRICS;
  currentDonation: DemoDonationItem;
  enterDemo: () => void;
  exitDemo: () => void;
  resetDemo: () => void;
  loginAsDemoAccount: (type: DemoAccountType) => void;
  logoutDemoUser: () => void;
  setFlowStep: (step: DemoFlowStep) => void;
  setActiveRole: (role: DemoRole) => void;
  updateDonationForm: (updates: Partial<DemoDonationItem>) => void;
  submitDonationToAI: () => void;
  approveSafetyVerify: () => void;
  confirmNgoMatch: () => void;
  advancePickupStatus: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(IS_DEMO_MODE_CONFIGURED);
  const [activeDemoAccount, setActiveDemoAccount] = useState<DemoAccountType | null>('restaurant');
  const [activeRole, setActiveRoleState] = useState<DemoRole>('Restaurant');
  const [flowStep, setFlowStepState] = useState<DemoFlowStep>('overview');
  const [demoMetrics, setDemoMetrics] = useState(INITIAL_DEMO_METRICS);
  const [currentDonation, setCurrentDonation] = useState<DemoDonationItem>(INITIAL_DEMO_DONATION);

  const activeUser: User = activeDemoAccount === 'admin'
    ? DEMO_ADMIN_USER
    : activeDemoAccount === 'ngo' 
    ? DEMO_NGO_USER 
    : activeDemoAccount === 'volunteer' 
    ? DEMO_VOLUNTEER_USER 
    : DEMO_RESTAURANT_USER;

  const loginAsDemoAccount = (type: DemoAccountType) => {
    setActiveDemoAccount(type);
    setIsDemoActive(true);
    if (type === 'admin') setActiveRoleState('Admin');
    else if (type === 'restaurant') setActiveRoleState('Restaurant');
    else if (type === 'ngo') setActiveRoleState('NGO');
    else if (type === 'volunteer') setActiveRoleState('Volunteer');
    setFlowStepState('overview');
  };

  const logoutDemoUser = () => {
    setActiveDemoAccount(null);
  };

  const enterDemo = () => {
    setIsDemoActive(true);
    setActiveDemoAccount('restaurant');
    setActiveRoleState('Restaurant');
    setFlowStepState('overview');
  };

  const exitDemo = () => {
    setIsDemoActive(false);
    setActiveDemoAccount(null);
  };

  const resetDemo = () => {
    setDemoMetrics(INITIAL_DEMO_METRICS);
    setCurrentDonation({ ...INITIAL_DEMO_DONATION, status: 'DRAFT' });
    setFlowStepState('overview');
  };

  const setActiveRole = (role: DemoRole) => {
    setActiveRoleState(role);
  };

  const setFlowStep = (step: DemoFlowStep) => {
    setFlowStepState(step);
  };

  const updateDonationForm = (updates: Partial<DemoDonationItem>) => {
    setCurrentDonation(prev => ({ ...prev, ...updates }));
  };

  const submitDonationToAI = () => {
    setCurrentDonation(prev => ({
      ...prev,
      status: 'AI_ANALYZED',
      freshnessScore: 92,
      confidenceScore: 96,
      safetyStatus: 'Suitable for Redistribution',
    }));
    setFlowStepState('ai_analysis');
  };

  const approveSafetyVerify = () => {
    setCurrentDonation(prev => ({
      ...prev,
      status: 'VERIFIED',
    }));
    setFlowStepState('ngo_match');
  };

  const confirmNgoMatch = () => {
    setCurrentDonation(prev => ({
      ...prev,
      status: 'NGO_MATCHED',
    }));
    setDemoMetrics(prev => ({
      ...prev,
      activeDonations: prev.activeDonations + 1,
    }));
    setFlowStepState('pickup');
  };

  const advancePickupStatus = () => {
    setCurrentDonation(prev => {
      let nextStatus = prev.status;
      if (prev.status === 'NGO_MATCHED') nextStatus = 'PICKUP_IN_PROGRESS';
      else if (prev.status === 'PICKUP_IN_PROGRESS') nextStatus = 'DELIVERED';
      
      if (nextStatus === 'DELIVERED') {
        setDemoMetrics(m => ({
          ...m,
          foodSavedKg: m.foodSavedKg + 25,
          mealsDistributed: m.mealsDistributed + 100,
          completedDonations: m.completedDonations + 1,
        }));
      }

      return { ...prev, status: nextStatus };
    });
  };

  return (
    <DemoContext.Provider value={{
      isDemoActive,
      activeDemoAccount,
      activeUser,
      activeRole,
      flowStep,
      demoMetrics,
      currentDonation,
      enterDemo,
      exitDemo,
      resetDemo,
      loginAsDemoAccount,
      logoutDemoUser,
      setFlowStep,
      setActiveRole,
      updateDonationForm,
      submitDonationToAI,
      approveSafetyVerify,
      confirmNgoMatch,
      advancePickupStatus,
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
