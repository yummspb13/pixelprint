'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  Mail,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminCard from "@/components/admin/AdminCard";
import ScrollReveal from "@/components/ux/ScrollReveal";
import WaveLoader from "@/components/ui/WaveLoader";
import { toast } from "sonner";

interface SettingsData {
  [key: string]: {
    value: string;
    description?: string;
    category: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (data.ok) {
        setSettings(data.settings);
      } else {
        toast.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (data.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }));
  };

  const getSettingValue = (key: string, defaultValue: string = '') => {
    return settings[key]?.value || defaultValue;
  };

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'list' }),
      });

      const data = await response.json();
      if (data.ok) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const createBackup = async () => {
    try {
      setBackupLoading(true);
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create' }),
      });

      const data = await response.json();
      if (data.ok) {
        toast.success('Backup created successfully');
        fetchBackups(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const restoreBackup = async (backupFile: string) => {
    if (!confirm(`Are you sure you want to restore from ${backupFile}? This will replace the current database.`)) {
      return;
    }

    try {
      setBackupLoading(true);
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore', backupFile }),
      });

      const data = await response.json();
      if (data.ok) {
        toast.success('Database restored successfully');
        fetchBackups(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to restore backup');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Failed to restore backup');
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <WaveLoader />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
              <span className="text-px-fg">System </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                Settings
              </span>
            </h1>
            <p className="text-lg text-px-muted max-w-2xl mt-2">
              Configure system settings and preferences
            </p>
          </div>
          <Button 
            onClick={saveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
          >
            {saving ? (
              <WaveLoader />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </ScrollReveal>

      {/* General Settings */}
      <ScrollReveal>
        <AdminCard title="General Settings">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={getSettingValue('site_name', 'Pixel Print')}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <Label htmlFor="site-url">Site URL</Label>
                <Input
                  id="site-url"
                  value={getSettingValue('site_url', 'https://pixelprint.com')}
                  onChange={(e) => updateSetting('site_url', e.target.value)}
                  placeholder="Enter site URL"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="site-description">Site Description</Label>
              <Textarea
                id="site-description"
                value={getSettingValue('site_description', 'Professional printing services for all your business needs')}
                onChange={(e) => updateSetting('site_description', e.target.value)}
                placeholder="Enter site description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="Europe/London">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="America/New_York">New York (EST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="GBP">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Appearance Settings */}
      <ScrollReveal>
        <AdminCard title="Appearance">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primary-color"
                    type="color"
                    defaultValue="#00BCD4"
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    defaultValue="#00BCD4"
                    placeholder="#00BCD4"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    defaultValue="#E91E63"
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    defaultValue="#E91E63"
                    placeholder="#E91E63"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-px-muted">Enable dark mode for the admin panel</p>
              </div>
              <Switch id="dark-mode" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="animations">Animations</Label>
                <p className="text-sm text-px-muted">Enable smooth animations and transitions</p>
              </div>
              <Switch id="animations" defaultChecked />
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Email Settings */}
      <ScrollReveal>
        <AdminCard title="Email Configuration">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  defaultValue="smtp.gmail.com"
                  placeholder="Enter SMTP host"
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  defaultValue="587"
                  placeholder="Enter SMTP port"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input
                  id="smtp-username"
                  type="email"
                  defaultValue="admin@pixelprint.com"
                  placeholder="Enter SMTP username"
                />
              </div>
              <div>
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  placeholder="Enter SMTP password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-px-muted">Send email notifications for orders and updates</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Security Settings */}
      <ScrollReveal>
        <AdminCard title="Security">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-px-muted">Require 2FA for admin access</p>
              </div>
              <Switch id="two-factor" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="session-timeout">Session Timeout</Label>
                <p className="text-sm text-px-muted">Automatically log out inactive users</p>
              </div>
              <Switch id="session-timeout" defaultChecked />
            </div>

            <div>
              <Label htmlFor="session-duration">Session Duration (minutes)</Label>
              <Input
                id="session-duration"
                type="number"
                defaultValue="60"
                placeholder="Enter session duration"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <p className="text-sm text-px-muted">Restrict admin access to specific IP addresses</p>
              </div>
              <Switch id="ip-whitelist" />
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Backup Settings */}
      <ScrollReveal>
        <AdminCard title="Backup & Maintenance">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup">Automatic Backup</Label>
                <p className="text-sm text-px-muted">Automatically backup database daily</p>
              </div>
              <Switch id="auto-backup" defaultChecked />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="backup-retention">Retention Period (days)</Label>
                <Input
                  id="backup-retention"
                  type="number"
                  defaultValue="30"
                  placeholder="Enter retention period"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={createBackup}
                  disabled={backupLoading}
                >
                  {backupLoading ? (
                    <WaveLoader />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  {backupLoading ? 'Creating...' : 'Create Backup Now'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={fetchBackups}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh List
                </Button>
              </div>

              {/* Backup List */}
              {backups.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-px-fg">Available Backups:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {backups.map((backup, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{backup.fileName}</p>
                          <p className="text-xs text-px-muted">
                            {backup.fileSize} • {new Date(backup.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreBackup(backup.fileName)}
                          disabled={backupLoading}
                        >
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {backups.length === 0 && (
                <div className="text-center py-4 text-px-muted">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No backups available</p>
                </div>
              )}
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* System Information */}
      <ScrollReveal>
        <AdminCard title="System Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Globe className="h-8 w-8 text-px-cyan mx-auto mb-2" />
              <h4 className="font-medium text-px-fg mb-1">Version</h4>
              <p className="text-sm text-px-muted">v1.0.0</p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Database className="h-8 w-8 text-px-magenta mx-auto mb-2" />
              <h4 className="font-medium text-px-fg mb-1">Database</h4>
              <p className="text-sm text-px-muted">SQLite 3.40.0</p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <SettingsIcon className="h-8 w-8 text-px-yellow mx-auto mb-2" />
              <h4 className="font-medium text-px-fg mb-1">Last Updated</h4>
              <p className="text-sm text-px-muted">2024-01-15</p>
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>
    </div>
  );
}
