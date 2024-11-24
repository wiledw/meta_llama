'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePlaces } from "@/contexts/PlacesContext";

const LogoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { places, setPlaces } = usePlaces();

    
    useEffect(() => {
        if (searchParams.get('refresh') === 'true') {
            window.location.href = '/login';  // Force full page refresh
        } else {
            setTimeout(() => router.push("/login"), 2000);
        }
        setPlaces(null);
    }, [router, searchParams]);

    return <div>You have logged out... redirecting in a sec.</div>;
};

export default LogoutPage;