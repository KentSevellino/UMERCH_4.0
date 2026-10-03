export function censorEmail(email: string): string {
  if (!email) {
    return '';
  }

  const atIndex = email.indexOf('@');
  const name = atIndex === -1 ? email : email.slice(0, atIndex);
  const domain = atIndex === -1 ? '' : email.slice(atIndex + 1);

  const censoredName =
    name.length <= 2
      ? name.slice(0, 1) + '*'.repeat(Math.max(name.length - 1, 0))
      : name.slice(0, 1) + '*'.repeat(name.length - 2) + name.slice(-1);

  return `${censoredName}@${domain}`;
}

export default censorEmail;
