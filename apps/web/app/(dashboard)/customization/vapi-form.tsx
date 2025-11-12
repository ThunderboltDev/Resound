import {
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { UseFormReturn } from "react-hook-form";
import type { FormSchema } from "@/app/(dashboard)/customization/customization-form";
import { useVapiAssistants, useVapiPhoneNumbers } from "@/hooks/use-vapi-data";

type VapiFormProps = {
  form: UseFormReturn<FormSchema>;
  disabled?: boolean;
};

export function VapiForm({ form, disabled }: VapiFormProps) {
  const { data: assistants, isLoading: isAssistantsLoading } =
    useVapiAssistants();
  const { data: phoneNumbers, isLoading: isPhoneNumbersLoading } =
    useVapiPhoneNumbers();

  return (
    <>
      <FormField
        control={form.control}
        name="vapiSettings.assistantId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Voice Assistant</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isAssistantsLoading || disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isAssistantsLoading
                        ? "Loading assistants..."
                        : "Select an assistant"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {assistants?.map(
                  (assistant: {
                    id: string;
                    name: string;
                    model: { model: string };
                  }) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name || "Unnamed Assistant"} -{" "}
                      {assistant.model?.model || "Unknown Model"}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              The Vapi assistant to use for voice call
            </FormDescription>
            <FormError />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vapiSettings.phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Numbers</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isPhoneNumbersLoading || disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isPhoneNumbersLoading
                        ? "Loading phone numbers..."
                        : "Select a phone number"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {phoneNumbers?.map(
                  (phone: {
                    id: string;
                    name: string;
                    number: string;
                    model: { model: string };
                  }) => (
                    <SelectItem key={phone.id} value={phone.number || phone.id}>
                      {phone.number || "Unknown"} -{" "}
                      {phone.name || "Unknown Name"}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              Phone number to use for making and receiving calls
            </FormDescription>
            <FormError />
          </FormItem>
        )}
      />
    </>
  );
}
