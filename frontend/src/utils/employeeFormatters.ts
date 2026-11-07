export const formatEmployeeDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

export const formatEmployeeCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};
