export const calculateEMI = (principal: number, annualRate: number, tenureMonths: number): number => {
  const monthlyRate = annualRate / (12 * 100);
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
};

export const calculateTotalInterest = (emi: number, tenureMonths: number, principal: number): number =>
  Math.round(emi * tenureMonths - principal);

export const getHealthScoreLabel = (score: number): { label: string; color: string; gradient: string[] } => {
  if (score >= 80) return { label: 'Excellent', color: '#10B981', gradient: ['#059669', '#10B981'] };
  if (score >= 60) return { label: 'Good', color: '#06B6D4', gradient: ['#0891B2', '#06B6D4'] };
  if (score >= 40) return { label: 'Average', color: '#F59E0B', gradient: ['#D97706', '#F59E0B'] };
  return { label: 'Needs Work', color: '#EF4444', gradient: ['#DC2626', '#EF4444'] };
};

export const getLoanTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    home: '#7C3AED',
    car: '#06B6D4',
    personal: '#F59E0B',
    education: '#10B981',
    business: '#EF4444',
    gold: '#FBBF24',
    credit_card: '#EC4899',
  };
  return colors[type] ?? '#7C3AED';
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getDaysUntilDue = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
};

export const getEMIStatusColor = (status: string, colors: Record<string, string>): string => {
  switch (status) {
    case 'paid': return colors.success;
    case 'overdue': return colors.error;
    case 'pending': return colors.warning;
    default: return colors.secondary;
  }
};
