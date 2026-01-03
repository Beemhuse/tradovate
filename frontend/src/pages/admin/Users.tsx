import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban, Search, Eye, UserX } from "lucide-react";
import { useState } from "react";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", status: "Active", kyc: "Approved", balance: "$12,450.00" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", status: "Active", kyc: "Pending", balance: "$8,320.50" },
    { id: 3, name: "Mike Wilson", email: "mike.wilson@example.com", status: "Suspended", kyc: "Approved", balance: "$5,670.25" },
    { id: 4, name: "Sarah Jones", email: "sarah.jones@example.com", status: "Active", kyc: "Rejected", balance: "$3,890.75" },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage registered users and their accounts</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">KYC</th>
                    <th className="text-right py-3 px-4">Balance</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "Active" 
                            ? "bg-success/10 text-success" 
                            : "bg-danger/10 text-danger"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.kyc === "Approved" 
                            ? "bg-success/10 text-success" 
                            : user.kyc === "Pending"
                            ? "bg-primary/10 text-primary"
                            : "bg-danger/10 text-danger"
                        }`}>
                          {user.kyc}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">{user.balance}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-primary">
                            <UserX className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-danger">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
