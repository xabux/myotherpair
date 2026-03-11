export interface PasswordCheck {
  label: string;
  pass:  boolean;
}

export interface PasswordStrengthResult {
  score:  number;   // 0–5
  label:  string;
  color:  string;   // tailwind text color class
  barColor: string; // tailwind bg color class
  checks: PasswordCheck[];
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const checks: PasswordCheck[] = [
    { label: 'At least 8 characters',    pass: password.length >= 8 },
    { label: 'Uppercase letter (A–Z)',    pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a–z)',    pass: /[a-z]/.test(password) },
    { label: 'Number (0–9)',              pass: /[0-9]/.test(password) },
    { label: 'Special character (!@#…)', pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.pass).length;

  const levels = [
    { label: '',           color: 'text-muted-foreground', barColor: '' },
    { label: 'Very weak',  color: 'text-red-500',          barColor: 'bg-red-500' },
    { label: 'Weak',       color: 'text-orange-500',       barColor: 'bg-orange-500' },
    { label: 'Fair',       color: 'text-yellow-500',       barColor: 'bg-yellow-500' },
    { label: 'Good',       color: 'text-blue-400',         barColor: 'bg-blue-400' },
    { label: 'Strong',     color: 'text-green-500',        barColor: 'bg-green-500' },
  ];

  return { score, checks, ...levels[score] };
}
