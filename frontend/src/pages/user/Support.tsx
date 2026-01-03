import { useState } from "react";
import UserNav from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserSupport = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleEmailSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const email = "tradovatef@gmail.com";
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    // Open the default email client
    window.location.href = mailtoLink;

    toast({ title: "Opening email client..." });
    setSubject("");
    setMessage("");
  };

  const contactOptions = [
    {
      icon: Phone,
      label: "Phone Call",
      value: "+1 (585) 609-0385",
      action: () => window.location.href = "tel:+15856090385",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: MessageCircle, // WhatsApp usually represented by message/chat icon or brand icon if available
      label: "WhatsApp",
      value: "+1 (585) 609-0385",
      action: () => window.open("https://wa.me/15856090385", "_blank"),
      color: "bg-green-500/10 text-green-500"
    },
    {
      icon: Mail,
      label: "Email Support",
      value: "tradovatef@gmail.com",
      action: () => window.location.href = "mailto:tradovatef@gmail.com",
      color: "bg-orange-500/10 text-orange-500"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-6rem)] overflow-auto bg-background">
      {/* <UserNav /> */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Center</h1>
          <p className="text-muted-foreground">Choose a way to contact us</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full">
          <div className="grid md:grid-cols-1 gap-6 w-full md:w-1/3">
            {contactOptions.map((option, index) => (
              <Card key={index} className="hover:bg-secondary/50 transition-colors cursor-pointer" onClick={option.action}>
                <CardContent className="pt-6 flex items-center text-center gap-4">
                  <div className={`p-4 rounded-full ${option.color}`}>
                    <option.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Compose a message and send it directly via your email client.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="What is this regarding?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Type your message here..."
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleEmailSubmit}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Open Email Client
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSupport;
