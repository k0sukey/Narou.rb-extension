export function makeDateString(unixTime: string) {
  const d = new Date(parseInt(unixTime, 10) * 1000);
  if (isNaN(d.getTime())) {
    return '----/--/-- --:--';
  }
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const date = `${d.getDate()}`.padStart(2, '0');
  const hours = `${d.getHours()}`.padStart(2, '0');
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  return `${d.getFullYear()}/${month}/${date} ${hours}:${minutes}`;
}
