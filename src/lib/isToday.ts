export const isToday = (dateString1: string | null): boolean => {
  if (!dateString1) {
    return false;
  }

  const date1 = new Date(dateString1);
  const date2 = new Date();

  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};
