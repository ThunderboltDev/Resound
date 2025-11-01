import { Spinner } from "@workspace/ui/components/spinner";

function Loader({ ...props }: React.ComponentProps<typeof Spinner>) {
  return (
    <div className="w-full h-screen grid place-items-center">
      <Spinner className="text-info size-10" {...props} />
    </div>
  );
}

export { Loader };
