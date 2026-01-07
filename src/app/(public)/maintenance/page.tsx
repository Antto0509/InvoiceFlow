import MaintenanceClient from "@/components/maintenance/MaintenanceClient";
import { getUser } from "@/data/auth/getUser";

export default async function ConstructionPage() {
    const user = await getUser();
    
    const homeHref = user ? "/dashboard" : "/";

    return <MaintenanceClient homeHref={homeHref} />;
}