import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware wrappers: <Link href="/pricing"> keeps the visitor in /en or /ar.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
