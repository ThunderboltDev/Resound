"use client";

import { api } from "@workspace/backend/_generated/api";
import type { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { Check, Copy, Download, ShieldCheck } from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import html from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useCopyToClipboard } from "react-use";
import { toast } from "sonner";

interface VerificationSectionProps {
  website: Doc<"websites">;
  domain: string;
}

SyntaxHighlighter.registerLanguage("html", html);

export function VerificationSection({
  website,
  domain,
}: VerificationSectionProps) {
  const [copiedState, copyToClipboard] = useCopyToClipboard();

  const verifyOwnership = useAction(api.web.website.verify);

  const handleVerification = async (method: "html-file" | "meta-tag") => {
    try {
      await verifyOwnership({
        websiteId: website._id,
        verificationMethod: method,
      });

      toast.success("Verification completed!");
    } catch (error) {
      toast.error(
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Something went wrong!"
      );
    }
  };

  const verificationMethods = [
    {
      method: "html-file",
      title: "HTML File",
      instructions: (
        <>
          Download the verification file below and upload it to the{" "}
          <strong>root</strong> of your website. We will check:
        </>
      ),
      codeExample: `https://${domain}/resound-verification.html`,
      nextStep:
        "After uploading the file, click verify to verify your ownership.",
      primaryButtonContent: (
        <>
          <Download /> Download Verification File
        </>
      ),
      handleButtonClick: () => {
        const blob = new Blob([website.verificationToken], {
          type: "text/html",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "resound-verification.html";
        document.body.appendChild(link);
        link.click();

        URL.revokeObjectURL(url);
        link.remove();
      },
    },
    {
      method: "meta-tag",
      title: "Meta Tag",
      instructions: (
        <>
          Add the following <strong>meta tag</strong> inside the{" "}
          <code className="bg-secondary">&lt;head&gt;</code> of your homepage.
        </>
      ),
      codeExample: `<meta name="resound-verification" content="${website.verificationToken}" />;`,
      nextStep:
        "After adding the tag, publish your site and click verify to complete the process.",
      primaryButtonContent: copiedState.value ? (
        <>
          <Check /> Copied!
        </>
      ) : (
        <>
          <Copy /> Copy Meta Tag
        </>
      ),
      handleButtonClick: () => {
        copyToClipboard(
          `<meta name="resound-verification" content="${website.verificationToken}" />;`
        );
      },
    },
  ] as const;

  return (
    <>
      <h2 className="mt-10">Site Verification</h2>
      <p className="text-muted-foreground">
        You need to verify ownership of your website before can add pages.
      </p>

      <Tabs defaultValue="html-file" className="w-full mt-6">
        <TabsList className="grid grid-cols-2 w-full">
          {verificationMethods.map(({ method, title }) => (
            <TabsTrigger key={method} value={method}>
              {title}
            </TabsTrigger>
          ))}
        </TabsList>

        {verificationMethods.map(
          ({
            method,
            instructions,
            codeExample,
            nextStep,
            primaryButtonContent,
            handleButtonClick,
          }) => (
            <TabsContent
              key={method}
              value={method}
              className="text-muted-foreground space-y-4 mt-4"
            >
              <p>{instructions}</p>
              <SyntaxHighlighter
                language="html"
                style={atomOneDark}
                className="scrollbar-1.5 rounded-md !px-3"
              >
                {codeExample}
              </SyntaxHighlighter>
              <p>{nextStep}</p>
              <div className="py-2 grid grid-rows-2 gap-3 xs:grid-rows-1 xs:grid-cols-2">
                <Button
                  variant="default"
                  theme="default"
                  onClick={handleButtonClick}
                >
                  {primaryButtonContent}
                </Button>
                <Button
                  variant="default"
                  theme="success"
                  onClick={() => handleVerification(method)}
                >
                  <ShieldCheck />
                  Verify Ownership
                </Button>
              </div>
            </TabsContent>
          )
        )}
      </Tabs>
    </>
  );
}
