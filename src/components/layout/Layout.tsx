import { ReactNode } from "react";

/**
 * Thin passthrough. The page chrome (navbar, footer, back-to-top) and the page
 * transition now live in RootLayout, which wraps all public routes as a
 * persistent shell. Pages can keep wrapping content in <Layout> — it adds no
 * markup, so the navbar/footer stay mounted and consistent across navigations.
 */
const Layout = ({ children }: { children: ReactNode }) => <>{children}</>;

export default Layout;
