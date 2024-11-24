'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePlaces } from "@/contexts/PlacesContext";

const LogoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { places, setPlaces } = usePlaces();

    
    useEffect(() => {
        if (searchParams.get('refresh') === 'true') {
            window.location.href = '/';  
        } else {
            setTimeout(() => router.push("/"), 2000);
        }
        setPlaces(null);
    }, [router, searchParams, setPlaces]);

    return <div>You have logged out... redirecting in a sec.</div>;
};

export default LogoutPage;