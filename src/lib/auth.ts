export function validateAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || 'harsh@in2ccq.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Harsh@1234'
  return email === adminEmail && password === adminPassword
}
