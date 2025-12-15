// Shared helpers for admin forms and date handling

export type ItemWithId = { id: number; [key: string]: any };

export const setterBuilderObject = <T extends object, K extends keyof T>(
  setter: React.Dispatch<React.SetStateAction<T>>,
) => {
  return (prop: K) => {
    return (newValue: T[K]) => {
      setter((prev) => ({
        ...prev,
        [prop]: newValue,
      }));
    };
  };
};

export const setterBuilderArray = <T extends ItemWithId, K extends keyof T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
) => {
  return (id: number, prop: K) => {
    return (newValue: T[K]) => {
      setter((prevArray) => prevArray.map((item) => (item.id === id ? { ...item, [prop]: newValue } : item)));
    };
  };
};

export const toDatetimeLocal = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export const fromDatetimeLocal = (localDateString: string) => {
  const localDate = new Date(localDateString);
  const offset = localDate.getTimezoneOffset();
  const utcDate = new Date(localDate.getTime() + offset * 60 * 1000);
  return utcDate.toISOString();
};

export const formatDateTimeLocal = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
    dateStyle: "short",
    hour12: false,
  }).format(date);
};
