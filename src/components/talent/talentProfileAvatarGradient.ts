const GRADIENTS = [
  "linear-gradient(135deg,#818CF8,#4F46E5)",
  "linear-gradient(135deg,#34D399,#059669)",
  "linear-gradient(135deg,#FBBF24,#D97706)",
  "linear-gradient(135deg,#60A5FA,#2563EB)",
  "linear-gradient(135deg,#F472B6,#DB2777)",
  "linear-gradient(135deg,#A78BFA,#7C3AED)",
];

const GRADIENT_PAIRS: [string, string][] = [
  ["#818CF8", "#4F46E5"],
  ["#34D399", "#059669"],
  ["#FBBF24", "#D97706"],
  ["#60A5FA", "#2563EB"],
  ["#F472B6", "#DB2777"],
  ["#A78BFA", "#7C3AED"],
];

function hashId(employeeId: string): number {
  let h = 0;
  for (let i = 0; i < employeeId.length; i++) h = (h << 5) - h + employeeId.charCodeAt(i);
  return Math.abs(h);
}

export function getAvatarGradient(employeeId: string): string {
  return GRADIENTS[hashId(employeeId) % GRADIENTS.length];
}

export function getAvatarGradientPair(employeeId: string): [string, string] {
  return GRADIENT_PAIRS[hashId(employeeId) % GRADIENT_PAIRS.length];
}
