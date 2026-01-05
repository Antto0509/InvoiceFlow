import NotFoundClient from "@/components/not-found/NotFoundClient";
import { getUser } from "@/data/auth/getUser";

export default async function NotFound() {
  const user = await getUser();

  const homeHref = user ? "/dashboard" : "/";

  return <NotFoundClient homeHref={homeHref} />;
}
