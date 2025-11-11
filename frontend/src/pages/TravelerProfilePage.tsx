/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import TravelerHeader from "../components/profile/travelerPublicProfile/TravelerHeader";
import TravelerReviewsGrid from "../components/profile/travelerPublicProfile/TravelerReviewsGrid";
import { getReviewsForUser } from "../services/reviewService";
import { useAuth } from "../hooks/useAuth";

const TravelerProfilePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { account } = location.state || {};
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {accessToken} = useAuth();

  useEffect(() => {
    if (!account?.id) return;
    if (!accessToken) {
      console.error("No access token available");
      // TODO: comunicar que necesitan estar loggeados para ver sus publicaciones
      return;
    }
    
    const fetchReviews = async () => {

      try {
        const resultsReviews: any[] = [];
        const response = await getReviewsForUser(accessToken, account.id);
        if (response!=null){
          resultsReviews.push(...response.reviews);
        }
        setReviews(resultsReviews);
      } catch (error) {
        console.error("Error al obtener reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [account?.id, accessToken]);

  if (!account)
    return (
      <Box p={4}>
        <Typography variant="h6">No se encontró el perfil solicitado.</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
        px: 2,
      }}
    >
      <TravelerHeader account={account} reviewsCount={reviews.length} />

      {loading ? (
        <Box mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TravelerReviewsGrid
          reviews={reviews}
          onNavigateBusiness={async (userId: string) => {
            console.log("Should be redirecting to business profile");
            try {
              const response = await fetch(`/users/business/${userId}`);
              const businessAccountData = await response.json();
              if (businessAccountData.businessType === "HOTEL") {
                navigate(`/hotel/${businessAccountData.id}`, {
                  state: { account: businessAccountData },
                });
              } else {
                navigate(`/restaurant/${businessAccountData.id}`, {
                  state: { account: businessAccountData },
                });
              }
            } catch (error) {
              console.error("Error al obtener negocio:", error);
            }
          }}
        />
      )}
    </Box>
  );
};

export default TravelerProfilePage;
