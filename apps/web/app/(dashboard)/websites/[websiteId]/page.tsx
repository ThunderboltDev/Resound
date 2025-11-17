"use client";

import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { LoadingScreen } from "@workspace/ui/components/loading-screen";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { ExternalLink, Globe, Layers, Unlink, X } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pages } from "@/app/(dashboard)/websites/[websiteId]/pages";
import { WebsiteStatus } from "@/app/(dashboard)/websites/[websiteId]/status";
import { VerificationSection } from "@/app/(dashboard)/websites/[websiteId]/verification";
import {
  PageBody,
  PageDescription,
  PageHeader,
  PageTitle,
  PageWrapper,
} from "@/components/ui/page";

export default function WebsitePage() {
  const params = useParams();
  const router = useRouter();

  const websiteId = params.websiteId as Id<"websites">;

  const pages = useQuery(api.web.page.getAll, {
    websiteId,
  });

  const unlinkWebsite = useMutation(api.web.website.unlink);

  const website = useQuery(
    api.web.website.get,
    websiteId
      ? {
          websiteId,
        }
      : "skip"
  );

  if (website === undefined) {
    return <LoadingScreen />;
  }

  if (website === null) {
    notFound();
  }

  const handleUnlink = async () => {
    try {
      await unlinkWebsite({ id: website._id });
      toast.success("Website unlinked");
      router.replace("/wesbsites");
    } catch (error) {
      toast.error(
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Something went wrong!"
      );
    }
  };

  const domain = new URL(website.url).hostname;

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Website Configuration</PageTitle>
        <PageDescription className="text-xl flex items-center gap-2">
          {domain}{" "}
          <Link href={website.url} target="_blank">
            <ExternalLink className="size-5" />
          </Link>
        </PageDescription>
      </PageHeader>
      <PageBody>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              Website Details
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 flex flex-col gap-2 text-base">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Domain</span>
              <span>{domain}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pages Indexed</span>
              <div className="flex items-center gap-2">
                <Layers size={18} />
                <span>{pages?.length ?? 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <WebsiteStatus status={website.status} />
            </div>

            {website.status === "verified" && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Verification Method
                </span>
                <span>{website.verificationMethod}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Linked On</span>
              <span>
                {new Date(website._creationTime).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {website.status !== "verified" ? (
          <VerificationSection domain={domain} website={website} />
        ) : (
          <Pages website={website} />
        )}

        <h2 className="mt-10">Danger Zone</h2>
        <div className="flex gap-2 justify-between items-center">
          <p className="text-muted-foreground">Unlink your website</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="transparent" theme="danger">
                <Unlink />
                Unlink Website
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Unlink Website</DialogTitle>
                <DialogDescription>
                  Are you sure you want to unlink{" "}
                  <Link href={website.url} target="_blank">
                    {website.url}
                  </Link>
                  ? This will revoke ownership of the website from you and also
                  remove all the pages associated with this website. This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    onClick={handleUnlink}
                    variant="default"
                    theme="danger"
                  >
                    <Unlink />
                    Unlink Website
                  </Button>
                </DialogClose>

                <DialogClose asChild>
                  <Button variant="ghost" theme="default">
                    <X className="size-4" />
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageBody>
    </PageWrapper>
  );
}
