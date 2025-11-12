import { api } from "@workspace/backend/_generated/api";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PhoneNumbers = typeof api.vapi.getPhoneNumbers._returnType;
type Assistants = typeof api.vapi.getAssistants._returnType;

export function useVapiPhoneNumbers() {
  const [data, setData] = useState<PhoneNumbers>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getPhoneNumbers = useAction(api.vapi.getPhoneNumbers);

  // biome-ignore lint/correctness/useExhaustiveDependencies: infinite rerenders
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const result = await getPhoneNumbers();

        if (cancelled) return;

        setData(result);
        setError(null);
      } catch (error) {
        if (cancelled) return;

        toast.error("Failed to fetch phone numbers");
        setError(error as Error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data: data as PhoneNumbers,
    isLoading,
    error,
  };
}

export function useVapiAssistants() {
  const [data, setData] = useState<Assistants>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getAssistants = useAction(api.vapi.getAssistants);

  // biome-ignore lint/correctness/useExhaustiveDependencies: prevent infinite rerenders
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const result = await getAssistants();

        if (cancelled) return;

        setData(result);
        setError(null);
      } catch (error) {
        if (cancelled) return;

        toast.error("Failed to fetch phone numbers");
        setError(error as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data: data as Assistants,
    isLoading,
    error,
  };
}
