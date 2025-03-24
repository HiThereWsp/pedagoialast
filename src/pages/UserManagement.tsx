// pages/UserManagement.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ArrowLeft, X, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface UserProfile {
  id: number;
  user_email: string;
  is_beta: boolean;
  is_ambassador: boolean;
  is_admin: boolean;
  role_expiry: string | null;
}

export default function UserManagement() {
  const { toast } = useToast();
  const { user, authReady } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user);
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .order("id", { ascending: true });

      if (error) throw error;

      setAllUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs. Veuillez réessayer ou vous reconnecter.",
        variant: "destructive",
      });
      setAllUsers([]);
      setFilteredUsers([]);
      setTotalPages(1);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter((user) =>
          user.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setPage(1);
  }, [searchQuery, allUsers]);

  useEffect(() => {
    const totalFiltered = filteredUsers.length;
    setTotalPages(Math.ceil(totalFiltered / pageSize));

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [filteredUsers, page, pageSize]);

  useEffect(() => {
    if (!authReady) {
      console.log("Auth not ready yet");
      return;
    }

    if (!user) {
      console.log("No user found, redirecting to login");
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (profileLoading) {
      console.log("Profile is still loading...");
      return;
    }

    if (profileError || profile === null) {
      console.log("Profile error or not found, redirecting to home");
      toast({
        title: "Profil non trouvé",
        description: "Impossible de charger votre profil. Veuillez réessayer ou contacter le support.",
        variant: "destructive",
      });
      navigate("/home");
      return;
    }

    if (!profile.is_admin) {
      console.log("User is not an admin, redirecting to home");
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent voir cette page.",
        variant: "destructive",
      });
      navigate("/home");
    } else {
      console.log("User is an admin, fetching users...");
      fetchAllUsers();
    }
  }, [authReady, user, profile, profileLoading, profileError, navigate, toast]);

  const updateUserFlag = async (
      userId: number,
      flag: "is_beta" | "is_ambassador" | "is_admin",
      value: boolean,
      expiryDate: Date | null
  ) => {
    try {
      const user = allUsers.find((u) => u.id === userId);
      if (!user) throw new Error("User not found");

      const updateData: any = { [flag]: value };
      const hasActiveRole = (user.is_beta || user.is_ambassador || user.is_admin || value);

      if (hasActiveRole) {
        updateData.role_expiry = expiryDate ? expiryDate.toISOString() : null;
      } else {
        updateData.role_expiry = null;
      }

      const { error } = await supabase
          .from("user_profiles")
          .update(updateData)
          .eq("id", userId);

      if (error) throw error;

      setAllUsers((prevUsers) =>
          prevUsers.map((u) =>
              u.id === userId ? { ...u, [flag]: value, role_expiry: hasActiveRole ? (expiryDate ? expiryDate.toISOString() : null) : null } : u
          )
      );
      setFilteredUsers((prevFiltered) =>
          prevFiltered.map((u) =>
              u.id === userId ? { ...u, [flag]: value, role_expiry: hasActiveRole ? (expiryDate ? expiryDate.toISOString() : null) : null } : u
          )
      );

      if (value) {
        await sendWelcomeEmail(user.user_email, flag);
      }

      toast({
        title: "Succès",
        description: `${flag.replace("is_", "")} mis à jour pour l'utilisateur.`,
      });
    } catch (error) {
      console.error(`Error updating ${flag}:`, error);
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour ${flag.replace("is_", "")}.`,
        variant: "destructive",
      });
    }
  };

  const updateExpiryDate = async (userId: number, expiryDate: Date | null) => {
    try {
      const user = allUsers.find((u) => u.id === userId);
      if (!user) throw new Error("User not found");

      const { error } = await supabase
          .from("user_profiles")
          .update({ role_expiry: expiryDate ? expiryDate.toISOString() : null })
          .eq("id", userId);

      if (error) throw error;

      setAllUsers((prevUsers) =>
          prevUsers.map((u) =>
              u.id === userId ? { ...u, role_expiry: expiryDate ? expiryDate.toISOString() : null } : u
          )
      );
      setFilteredUsers((prevFiltered) =>
          prevFiltered.map((u) =>
              u.id === userId ? { ...u, role_expiry: expiryDate ? expiryDate.toISOString() : null } : u
          )
      );

      toast({
        title: "Succès",
        description: "Date d'expiration mise à jour.",
      });
    } catch (error) {
      console.error("Error updating expiry date:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la date d'expiration.",
        variant: "destructive",
      });
    }
  };

  const sendWelcomeEmail = async (email: string, role: "is_beta" | "is_ambassador" | "is_admin") => {
    try {
      const roleName = role.replace("is_", "");
      const response = await fetch("https://<your-supabase-project>.supabase.co/functions/v1/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`,
        },
        body: JSON.stringify({
          type: "welcome",
          email,
          role: roleName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send welcome email");
      }

      console.log(`Welcome email sent to ${email} for role ${roleName}`);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de bienvenue.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
          >
            Prev
          </Button>
          {pageNumbers.map((pageNum) => (
              <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
          ))}
          <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
    );
  };

  const paddedUsers = [...displayedUsers];
  while (paddedUsers.length < pageSize) {
    paddedUsers.push(null);
  }

  if (!authReady || profileLoading) {
    console.log("Rendering loading state: auth or profile not ready");
    return <div>Chargement de l'authentification...</div>;
  }

  return (
      <>
        <SEO
            title="Gestion des utilisateurs | PedagoIA"
            description="Gérez les utilisateurs de PedagoIA, mettez à jour leurs statuts (bêta, ambassadeur, admin)."
        />
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link to="/home" className="block mb-8">
              <img
                  src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png"
                  alt="PedagoIA Logo"
                  className="w-[100px] h-[120px] object-contain mx-auto"
              />
            </Link>
            <Card className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="text-center flex-1">
                  <h1 className="text-3xl font-bold tracking-tight text-primary mb-4">
                    Gestion des utilisateurs
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Liste des utilisateurs avec leurs statuts actuels. Utilisez les interrupteurs pour modifier les permissions.
                  </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate("/home")}
                    className="ml-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </div>

              <div className="mb-6 relative z-10">
                <Input
                    type="text"
                    placeholder="Rechercher par email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md mx-auto"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Bêta</TableHead>
                    <TableHead className="text-center">Ambassadeur</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Expiration des rôles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(loading || profileLoading) ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          <LoadingIndicator />
                        </TableCell>
                      </TableRow>
                  ) : paddedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Aucun utilisateur trouvé.
                        </TableCell>
                      </TableRow>
                  ) : (
                      paddedUsers.map((user, index) => {
                        if (!user) {
                          return (
                              <TableRow key={`empty-${index}`}>
                                <TableCell className="text-center text-muted-foreground">-</TableCell>
                                <TableCell className="text-center text-muted-foreground">-</TableCell>
                                <TableCell className="text-center text-muted-foreground">-</TableCell>
                                <TableCell className="text-center text-muted-foreground">-</TableCell>
                                <TableCell className="text-center text-muted-foreground">-</TableCell>
                              </TableRow>
                          );
                        }

                        const hasActiveRole = user.is_beta || user.is_ambassador || user.is_admin;

                        return (
                            <TableRow key={user.id}>
                              <TableCell>{user.user_email}</TableCell>

                              {/* Bêta Role */}
                              <TableCell className="text-center">
                                <Switch
                                    checked={user.is_beta}
                                    onCheckedChange={(value) =>
                                        updateUserFlag(user.id, "is_beta", value, user.role_expiry ? new Date(user.role_expiry) : null)
                                    }
                                />
                              </TableCell>

                              {/* Ambassadeur Role */}
                              <TableCell className="text-center">
                                <Switch
                                    checked={user.is_ambassador}
                                    onCheckedChange={(value) =>
                                        updateUserFlag(user.id, "is_ambassador", value, user.role_expiry ? new Date(user.role_expiry) : null)
                                    }
                                />
                              </TableCell>

                              {/* Admin Role */}
                              <TableCell className="text-center">
                                <Switch
                                    checked={user.is_admin}
                                    onCheckedChange={(value) =>
                                        updateUserFlag(user.id, "is_admin", value, user.role_expiry ? new Date(user.role_expiry) : null)
                                    }
                                />
                              </TableCell>

                              {/* Expiry Date */}
                              <TableCell className="text-center">
                                {hasActiveRole ? (
                                    <div className="relative flex items-center justify-center gap-1">
                                      <DatePicker
                                          selected={user.role_expiry ? new Date(user.role_expiry) : null}
                                          onChange={(date: Date | null) => updateExpiryDate(user.id, date)}
                                          dateFormat="yyyy-MM-dd"
                                          placeholderText="Sélectionner une date"
                                          className="text-sm border rounded p-2 w-36 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary pr-8"
                                          // minDate={new Date()}
                                          popperClassName="z-[200]" // Increased z-index
                                          showPopperArrow={false}
                                          popperPlacement="bottom-end" // Align popper to the right edge of the input
                                          popperModifiers={[]}
                                      />
                                      <Calendar className="absolute right-2 h-4 w-4 text-gray-500 pointer-events-none" />
                                      {user.role_expiry && (
                                          <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => updateExpiryDate(user.id, null)}
                                              className="ml-1"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                      )}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
              {displayedUsers.length > 0 && !loading && !profileLoading && renderPagination()}
            </Card>
          </div>
        </div>
      </>
  );
}