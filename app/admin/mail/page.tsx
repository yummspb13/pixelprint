import { 
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Trash2,
  Search,
  Filter,
  Plus,
  Eye,
  Reply,
  Forward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminCard from "@/components/admin/AdminCard";
import ScrollReveal from "@/components/ux/ScrollReveal";

const emails = [
  {
    id: 1,
    from: "john@example.com",
    subject: "Business Cards Request",
    preview: "Hello! I need business cards for my company...",
    date: "2024-01-15 14:30",
    unread: true,
    priority: "high"
  },
  {
    id: 2,
    from: "sarah@company.com",
    subject: "Urgent Flyer Order",
    preview: "We urgently need flyers for an event...",
    date: "2024-01-15 12:15",
    unread: true,
    priority: "urgent"
  },
  {
    id: 3,
    from: "mike@business.co.uk",
    subject: "Order #1232 Confirmation",
    preview: "Thank you for the quick order processing...",
    date: "2024-01-15 10:45",
    unread: false,
    priority: "normal"
  },
  {
    id: 4,
    from: "emma@design.com",
    subject: "Design Question",
    preview: "Can you help with menu design?",
    date: "2024-01-14 16:20",
    unread: false,
    priority: "normal"
  },
  {
    id: 5,
    from: "david@restaurant.com",
    subject: "Quality Appreciation",
    preview: "Very pleased with the print quality...",
    date: "2024-01-14 09:30",
    unread: false,
    priority: "low"
  }
];

const priorityColors = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-yellow-100 text-yellow-800",
  normal: "bg-blue-100 text-blue-800",
  low: "bg-green-100 text-green-800"
};

export default function MailPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
              <span className="text-px-fg">Email </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                Management
              </span>
            </h1>
            <p className="text-lg text-px-muted max-w-2xl mt-2">
              Manage incoming and outgoing emails
            </p>
          </div>
          <Button className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </div>
      </ScrollReveal>

      {/* Email Integration Status */}
      <ScrollReveal>
        <AdminCard title="Email Integration Status">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <h3 className="font-medium text-px-fg">Email integration active</h3>
                <p className="text-sm text-px-muted">Gmail API connected • Last sync: 2 minutes ago</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Settings
              </Button>
              <Button variant="outline" size="sm">
                Sync
              </Button>
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Email Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ScrollReveal>
            <AdminCard title="Mail Folders">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                  <Badge className="ml-auto">12</Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Sent
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Trash
                </Button>
              </div>
            </AdminCard>
          </ScrollReveal>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <ScrollReveal>
            <AdminCard title="Email List">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-px-muted" />
                  <Input
                    type="text"
                    placeholder="Search emails..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Email List */}
              <div className="space-y-2">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      email.unread ? 'bg-px-cyan/5 border-px-cyan/20' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`font-medium ${email.unread ? 'text-px-fg' : 'text-px-muted'}`}>
                            {email.from}
                          </span>
                          <Badge className={priorityColors[email.priority as keyof typeof priorityColors]}>
                            {email.priority === 'urgent' ? 'Urgent' : 
                             email.priority === 'high' ? 'High' : 
                             email.priority === 'normal' ? 'Normal' : 'Low'}
                          </Badge>
                          {email.unread && (
                            <div className="w-2 h-2 bg-px-cyan rounded-full"></div>
                          )}
                        </div>
                        <h4 className={`text-sm ${email.unread ? 'font-semibold text-px-fg' : 'font-medium text-px-muted'}`}>
                          {email.subject}
                        </h4>
                        <p className="text-sm text-px-muted truncate mt-1">
                          {email.preview}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-xs text-px-muted">{email.date}</span>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Forward className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </ScrollReveal>
        </div>
      </div>

      {/* Email Templates */}
      <ScrollReveal>
        <AdminCard title="Email Templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-px-fg mb-2">Order Confirmation</h4>
              <p className="text-sm text-px-muted mb-3">Automatic order confirmation email</p>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-px-fg mb-2">Order Ready</h4>
              <p className="text-sm text-px-muted mb-3">Notification when order is ready for pickup</p>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-px-fg mb-2">Follow-up</h4>
              <p className="text-sm text-px-muted mb-3">Follow-up for additional services</p>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>
    </div>
  );
}