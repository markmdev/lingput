// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorNormalizer(error: any): { fields: Record<string, string>; general: string[] } {
  const fields: Record<string, string> = {};
  const general: string[] = [];
  if (!error) {
    return { fields, general };
  }
  if (error?.details && Array.isArray(error.details)) {
    for (const detail of error.details) {
      fields[detail.path[0]] = detail.message;
    }
  } else if (error?.message) {
    general.push(error.message);
  } else {
    general.push("Unexpected server error");
  }

  return { fields, general };
}
