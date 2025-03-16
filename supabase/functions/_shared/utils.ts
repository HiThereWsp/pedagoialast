
export type ResponseData = {
  success: boolean;
  message: string;
  [key: string]: any;
};

export const createResponse = (
  data: ResponseData,
  options: {
    status?: number;
    headers?: Record<string, string>;
  } = {}
): Response => {
  const { status = data.success ? 200 : 500, headers = {} } = options;
  
  return new Response(
    JSON.stringify(data),
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      status,
    }
  );
};

export const logError = (context: string, error: any) => {
  console.error(`Erreur dans ${context}:`, error);
  return error.message || "Une erreur inconnue est survenue";
};
