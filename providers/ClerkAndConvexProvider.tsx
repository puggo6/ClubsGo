import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";

const convex = new ConvexReactClient("https://gregarious-hawk-931.convex.cloud");

export default function ClerkAndConvexProvider({children}: {children: React.ReactNode}) {
  return (
    <ClerkProvider publishableKey={"pk_test_bmVhcmJ5LXN0dWQtMzUuY2xlcmsuYWNjb3VudHMuZGV2JA"} tokenCache={tokenCache}>
        <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <ClerkLoaded>{children}</ClerkLoaded>
        </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}