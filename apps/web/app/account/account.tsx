// "use client";

// import { sendGTMEvent } from "@next/third-parties/google";
// import { format } from "date-fns";
// import { Loader2, LogOut, Mail, Trash, User } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import type { Session } from "next-auth";
// import { toast } from "sonner";
// import { UAParser } from "ua-parser-js";
// import { trpc } from "@/app/_trpc/client";
// import ActionDialog from "@/components/ui/action-dialog";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import { UpgradeButton } from "@/components/upgrade-button";
// import config from "@/config";

// const plans = config.plans;

// const providers = {
//   google: {
//     name: "Google",
//     image: "/providers/google.webp",
//   },
//   github: {
//     name: "GitHub",
//     image: "/providers/github.webp",
//   },
//   nodemailer: {
//     name: "Email",
//     icon: <Mail className="text-secondary-foreground" />,
//   },
// } as const;

// interface AccountProps {
//   session: Session | null;
// }

// export default function Account({ session: currentSession }: AccountProps) {
//   const router = useRouter();
//   const utils = trpc.useUtils();

//   const { data: sessions } = trpc.user.getUserSessions.useQuery();
//   const { data: totalUsage } = trpc.user.getTotalUsage.useQuery();
//   const { data: userWithAccounts } = trpc.user.getUserWithAccounts.useQuery();

//   const { data: subscriptionPlan } =
//     trpc.subscription.getUserSubscriptionPlan.useQuery();

//   const { mutateAsync: deleteAccount } = trpc.user.deleteAccount.useMutation({
//     onSuccess: () => {
//       sendGTMEvent({
//         value: 1,
//         event: "account_action",
//         action: "delete_account",
//         user_id: userWithAccounts?.id,
//         subscription_plan: subscriptionPlan?.name,
//       });
//       router.replace("/auth?origin=/account");
//     },
//     onError: () => {
//       sendGTMEvent({
//         value: 1,
//         event: "account_action",
//         action: "delete_account_failed",
//         user_id: userWithAccounts?.id,
//         subscription_plan: subscriptionPlan?.name,
//       });
//       toast.error("Something went wrong while deleting your account!");
//     },
//   });

//   const { mutateAsync: deleteSession } =
//     trpc.user.deleteUserSession.useMutation({
//       onSuccess: () => {
//         sendGTMEvent({
//           value: 1,
//           event: "account_action",
//           action: "delete_session",
//           user_id: userWithAccounts?.id,
//           subscription_plan: subscriptionPlan?.name,
//         });
//         utils.user.getUserSessions.invalidate();
//         toast.success("Device removed!");
//       },
//       onError: () => {
//         sendGTMEvent({
//           value: 1,
//           event: "account_action",
//           action: "delete_session_failed",
//           user_id: userWithAccounts?.id,
//           subscription_plan: subscriptionPlan?.name,
//         });
//         toast.error("Failed to remove device!");
//       },
//     });

//   return (
//     <div className="container-2xl mt-20">
//       <h2>Account</h2>
//       <p>Manage your account information</p>
//       <h6 className="mt-6">Profile</h6>
//       <Separator />
//       <div className="mt-3 flex items-center justify-start gap-4">
//         <Avatar className="size-16 shadow-sm">
//           {userWithAccounts && (
//             <AvatarImage
//               alt="Your profile avatar"
//               src={userWithAccounts.image ?? ""}
//             />
//           )}
//           <AvatarFallback className="bg-secondary text-2xl">
//             <User className="size-10 text-muted-foreground" />
//           </AvatarFallback>
//         </Avatar>
//         <div>
//           {userWithAccounts ? (
//             <p className="font-semibold text-lg">
//               {userWithAccounts.name ?? "You"}
//             </p>
//           ) : (
//             <Skeleton width={160} />
//           )}
//           <p className="text-muted-foreground text-sm break-all">
//             {userWithAccounts ? (
//               userWithAccounts.email
//             ) : (
//               <Skeleton width={80} />
//             )}
//           </p>
//         </div>
//       </div>
//       <h6 className="mt-8">Accounts</h6>
//       <Separator />
//       <div className="mt-2 flex flex-col gap-2">
//         {userWithAccounts ? (
//           userWithAccounts.accounts.map((account) => {
//             const provider = account.provider as keyof typeof providers;
//             const providerName = providers[provider].name;
//             return (
//               <div
//                 key={account.provider}
//                 className="flex flex-row gap-2 items-center"
//               >
//                 {provider === "nodemailer" ? (
//                   providers[provider].icon
//                 ) : (
//                   <Image
//                     src={providers[provider].image}
//                     alt={`Provider: ${providerName}`}
//                     className="size-5"
//                     width={128}
//                     height={128}
//                     loading="lazy"
//                   />
//                 )}
//                 <span className="font-medium">{providerName}</span>
//                 <span className="text-muted-foreground">
//                   {format(new Date(account.createdAt), "dd/MM/yyyy")}
//                 </span>
//               </div>
//             );
//           })
//         ) : (
//           <>
//             <Skeleton inline width={120} height={24} borderRadius={5} />
//             <Skeleton inline width={160} height={24} borderRadius={5} />
//           </>
//         )}
//       </div>
//       <h6 className="mt-8">Subscription</h6>
//       <Separator />
//       <div className="mt-2 flex flex-col justify-between gap-4 xs:flex-row xs:items-center xs:gap-6">
//         <div>
//           {subscriptionPlan ? (
//             <p>
//               You are currently on the{" "}
//               <span className="font-medium">{subscriptionPlan.name} Plan</span>
//             </p>
//           ) : (
//             <Skeleton width={256} />
//           )}
//           <p className="text-muted-foreground text-sm">
//             {subscriptionPlan ? (
//               subscriptionPlan?.isSubscribed &&
//               subscriptionPlan?.currentPeriodEnd ? (
//                 <>
//                   {subscriptionPlan.isCanceled
//                     ? "Your plan will be canceled on "
//                     : "Your plan renews on "}
//                   {format(subscriptionPlan.currentPeriodEnd, "dd/MM/yyyy")}
//                 </>
//               ) : (
//                 <>
//                   Upgrade to <span className="font-medium">Pro Plan</span> for
//                   more features
//                 </>
//               )
//             ) : (
//               <Skeleton width={200} />
//             )}
//           </p>
//         </div>
//         <div>
//           {subscriptionPlan ? (
//             <UpgradeButton isSubscribed={subscriptionPlan.isSubscribed} />
//           ) : (
//             <Skeleton borderRadius={6} height={36} width={150} />
//           )}
//         </div>
//       </div>
//       <h6 className="mt-8">Total Usage</h6>
//       <Separator />
//       <div className="mt-2">
//         <p>
//           <span className="font-medium">Files Uploaded:</span>{" "}
//           {totalUsage ? (
//             <span>
//               {totalUsage.files} /{" "}
//               {subscriptionPlan?.isSubscribed
//                 ? plans.pro.maxFiles
//                 : plans.free.maxFiles}
//             </span>
//           ) : (
//             <Skeleton className="inline" width={50} />
//           )}
//         </p>
//         <p>
//           <span className="font-medium">Total Messages:</span>{" "}
//           {totalUsage?.messages ?? <Skeleton className="inline" width={35} />}
//         </p>
//       </div>
//       <h6 className="mt-8">Active Devices</h6>
//       <Separator />
//       <div className="mt-3 flex flex-col gap-2">
//         {sessions && sessions.length > 0 ? (
//           sessions.map((session) => {
//             const parser = new UAParser(session.userAgent ?? "");
//             const deviceName = `${parser.getOS().name ?? "???"} ${
//               parser.getOS().version ?? "- X.X.X"
//             }`;
//             const isCurrent =
//               session.sessionToken === currentSession?.sessionToken;
//             return (
//               <div
//                 className="flex flex-row items-center justify-between"
//                 key={`${session.userAgent}-${session.lastActivity}`}
//               >
//                 <div className="text-muted-foreground text-sm">
//                   <p className="flex flex-row items-center gap-2 font-semibold text-base text-secondary-foreground">
//                     {deviceName}
//                     {isCurrent && <Badge variant="primary">You</Badge>}
//                   </p>
//                   <p>
//                     {session.country && session.city && (
//                       <>
//                         {session.city}, {session.country}
//                       </>
//                     )}
//                   </p>
//                   <p>
//                     {parser.getBrowser().name ?? "Unknown Browser"}{" "}
//                     {parser.getBrowser().version ?? "- X.X.X"}
//                   </p>
//                   <p>
//                     {format(
//                       new Date(session.lastActivity),
//                       "dd/MM/yyyy hh:mm a"
//                     )}
//                   </p>
//                 </div>
//                 <div>
//                   {!isCurrent && (
//                     <ActionDialog
//                       button={{
//                         children: (
//                           <>
//                             <LogOut className="size-4" /> Remove
//                           </>
//                         ),
//                         variant: "danger",
//                         size: "sm",
//                       }}
//                       dialog={{
//                         title: "Remove Device",
//                         description: (
//                           <>
//                             Are you sure you want to remove{" "}
//                             <strong>{deviceName}</strong>? This will log the
//                             device out.
//                           </>
//                         ),
//                         button: {
//                           variant: "danger",
//                           children: (
//                             <>
//                               <LogOut className="size-4" />
//                               Remove Device
//                             </>
//                           ),
//                         },
//                         buttonChildrenWhenLoading: (
//                           <>
//                             <Loader2 className="size-4 animate-spin" />
//                             Removing...
//                           </>
//                         ),
//                       }}
//                       onConfirm={async () => {
//                         await deleteSession({
//                           sessionToken: session.sessionToken,
//                         });
//                       }}
//                     />
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <Skeleton
//             borderRadius={12}
//             height={64}
//             width={180}
//             count={2}
//             inline
//           />
//         )}
//       </div>
//       <h6 className="mt-8">Danger Zone</h6>
//       <Separator />
//       <div className="mt-2 mb-12 flex flex-col justify-between gap-4 xs:flex-row xs:items-center xs:gap-6">
//         <div>
//           <p>Delete your account</p>
//           <p className="text-muted-foreground text-sm">
//             Delete your account, all uploaded files and chat messages
//           </p>
//         </div>
//         <ActionDialog
//           button={{
//             className: "w-fit",
//             variant: "danger",
//             children: (
//               <>
//                 <Trash /> Delete Account
//               </>
//             ),
//           }}
//           dialog={{
//             title: "Delete Account",
//             description: (
//               <>
//                 Are you sure you want to delete your account? All of your user
//                 data, PDF files and chat history will be{" "}
//                 <strong>permanently</strong> deleted!
//               </>
//             ),
//             button: {
//               variant: "danger",
//               children: (
//                 <>
//                   <Trash className="size-4" />
//                   Delete Account
//                 </>
//               ),
//             },
//             buttonChildrenWhenLoading: (
//               <>
//                 <Loader2 className="size-4 animate-spin" />
//                 Deleting...
//               </>
//             ),
//           }}
//           onConfirm={async () => {
//             await deleteAccount();
//           }}
//         />
//       </div>
//     </div>
//   );
// }
