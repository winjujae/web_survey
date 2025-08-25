"use client";

import Providers from "./providers";
import CommunityHome from "../../features/posts/components/CommunityHome";
import LoginButton from "../../features/auth/components/LoginButton";
import AccountMenu from "../../features/auth/components/AccountMenu";

export default function AppRoot() {
  return (
    <Providers>
      <CommunityHome
        headerRight={
          <>
            <LoginButton />
            <AccountMenu />
          </>
        }
      />
    </Providers>
  );
}
