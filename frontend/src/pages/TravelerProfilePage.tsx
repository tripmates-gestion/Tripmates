import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import TravelerHeader from "../components/profile/travelerPublicProfile/TravelerHeader";
import TravelerReviewsGrid from "../components/profile/travelerPublicProfile/TravelerReviewsGrid";
import { getReviewsForUser } from "../services/reviewService";
import { useAuth } from "../hooks/useAuth";
import { useConnectionsList } from "../hooks/useConnectionsList";
import { ConnectionsListDialog } from "../components/social/ConnectionsListDialog";
import { FollowButton } from "../components/social/FollowButton";

const TravelerProfilePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { account } = location.state || {};
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<"followers" | "followings" | null>(null);
  const { accessToken } = useAuth();

  const userId = account?.id ?? null;

  const followersList = useConnectionsList("followers", userId, {
    enabled: Boolean(userId),
  });
  const followingsList = useConnectionsList("followings", userId, {
    enabled: Boolean(userId),
  });

  const {
    items: followerItems,
    loading: followersLoading,
    error: followersError,
    refresh: refreshFollowers,
  } = followersList;

  const {
    items: followingItems,
    loading: followingsLoading,
    error: followingsError,
    refresh: refreshFollowings,
  } = followingsList;

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

  const followerCount = followerItems.length;
  const followingCount = followingItems.length;

  const handleOpenFollowers = () => {
    void refreshFollowers();
    setActiveList("followers");
  };

  const handleOpenFollowings = () => {
    void refreshFollowings();
    setActiveList("followings");
  };

  const handleCloseDialog = () => setActiveList(null);

  const followButton = useMemo(() => {
    if (!userId) {
      return null;
    }

    return (
      <FollowButton
        targetUserId={userId}
        onFollowChange={() => {
          void refreshFollowers();
        }}
        sx={{
          minWidth: 180,
          fontWeight: 600,
        }}
      />
    );
  }, [refreshFollowers, userId]);

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
      <TravelerHeader
        account={account}
        reviewsCount={reviews.length}
        followerCount={followerCount}
        followingCount={followingCount}
        followersLoading={followersLoading}
        followingsLoading={followingsLoading}
        onFollowersClick={handleOpenFollowers}
        onFollowingsClick={handleOpenFollowings}
        followButton={followButton}
      />

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

      <ConnectionsListDialog
        open={activeList === "followers"}
        onClose={handleCloseDialog}
        type="followers"
        items={followerItems}
        loading={followersLoading}
        error={followersError}
        onRefresh={refreshFollowers}
        emptyMessage="Este viajero aún no tiene seguidores."
      />

      <ConnectionsListDialog
        open={activeList === "followings"}
        onClose={handleCloseDialog}
        type="followings"
        items={followingItems}
        loading={followingsLoading}
        error={followingsError}
        onRefresh={refreshFollowings}
        emptyMessage="Este viajero aún no sigue a nadie."
      />
    </Box>
  );
};

export default TravelerProfilePage;
