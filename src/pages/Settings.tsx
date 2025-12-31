import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  RotateCcw, 
  Palette, 
  Type, 
  Image, 
  Layout,
  FolderOpen,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  Check
} from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { BillingProvider, useBilling } from '@/contexts/BillingContext';
import { INPATIENT_CATEGORIES } from '@/types/billing';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Color picker component
const ColorPicker = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
}) => {
  // Parse HSL value
  const parseHSL = (hsl: string) => {
    const parts = hsl.split(' ');
    return {
      h: parseFloat(parts[0]) || 0,
      s: parseFloat(parts[1]) || 0,
      l: parseFloat(parts[2]) || 0,
    };
  };

  const { h, s, l } = parseHSL(value);

  const handleChange = (component: 'h' | 's' | 'l', newValue: number) => {
    const current = parseHSL(value);
    current[component] = newValue;
    onChange(`${current.h} ${current.s}% ${current.l}%`);
  };

  const previewColor = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div className="bg-surface-light border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <div 
          className="w-10 h-10 rounded-lg border-2 border-border shadow-inner"
          style={{ backgroundColor: previewColor }}
        />
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Hue</span>
            <span>{Math.round(h)}°</span>
          </div>
          <Slider
            value={[h]}
            onValueChange={([v]) => handleChange('h', v)}
            max={360}
            step={1}
            className="w-full"
          />
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Saturation</span>
            <span>{Math.round(s)}%</span>
          </div>
          <Slider
            value={[s]}
            onValueChange={([v]) => handleChange('s', v)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Lightness</span>
            <span>{Math.round(l)}%</span>
          </div>
          <Slider
            value={[l]}
            onValueChange={([v]) => handleChange('l', v)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, updateNavButton, resetSettings } = useAppSettings();
  const { inventory, setInventory, inpatientCategories } = useBilling();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const handleFileUpload = (type: 'logo' | 'favicon', file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'logo') {
        updateSettings({ logoUrl: dataUrl });
        toast.success('Logo updated');
      } else {
        updateSettings({ faviconUrl: dataUrl });
        toast.success('Favicon updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    if (inventory[newCategoryName]) {
      toast.error('Category already exists');
      return;
    }

    setInventory(prev => ({
      ...prev,
      [newCategoryName]: [],
    }));
    
    setNewCategoryName('');
    toast.success('Category added');
  };

  const handleDeleteCategory = (category: string) => {
    if (!confirm(`Delete category "${category}" and all its items?`)) return;
    
    setInventory(prev => {
      const newInv = { ...prev };
      delete newInv[category];
      return newInv;
    });
    
    toast.success('Category deleted');
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditingCategory(null);
      return;
    }
    
    if (inventory[newName]) {
      toast.error('Category already exists');
      return;
    }

    setInventory(prev => {
      const newInv = { ...prev };
      newInv[newName] = prev[oldName] || [];
      delete newInv[oldName];
      return newInv;
    });
    
    setEditingCategory(null);
    toast.success('Category renamed');
  };

  const allCategories = [...new Set([...Object.keys(inventory), ...INPATIENT_CATEGORIES])].sort();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to App</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={resetSettings}
              className="flex items-center gap-2 px-4 py-2 bg-surface-light border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-accent-red transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your application appearance and behavior</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-surface-light border border-border p-1 rounded-xl">
            <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Type className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="branding" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="navigation" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Layout className="w-4 h-4 mr-2" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FolderOpen className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" />
                Application Identity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={settings.appName}
                    onChange={(e) => updateSettings({ appName: e.target.value })}
                    className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="MCH Billing"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    App Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.appSubtitle}
                    onChange={(e) => updateSettings({ appSubtitle: e.target.value })}
                    className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="System"
                  />
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-light border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  {settings.isDarkMode ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <span className="font-bold text-foreground">Dark Mode</span>
                    <p className="text-sm text-muted-foreground">
                      {settings.isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.isDarkMode}
                  onCheckedChange={(checked) => updateSettings({ isDarkMode: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Color Scheme
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={settings.primaryColor}
                  onChange={(value) => updateSettings({ primaryColor: value })}
                />
                
                <ColorPicker
                  label="Accent Color"
                  value={settings.accentColor}
                  onChange={(value) => updateSettings({ accentColor: value })}
                />
                
                <ColorPicker
                  label="Background Color"
                  value={settings.backgroundColor}
                  onChange={(value) => updateSettings({ backgroundColor: value })}
                />
                
                <ColorPicker
                  label="Card Color"
                  value={settings.cardColor}
                  onChange={(value) => updateSettings({ cardColor: value })}
                />
              </div>

              {/* Color Presets */}
              <div className="space-y-3">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Quick Presets
                </span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Emerald', primary: '160 84% 39%', bg: '240 10% 4%' },
                    { name: 'Blue', primary: '217 91% 60%', bg: '222 84% 5%' },
                    { name: 'Purple', primary: '271 81% 56%', bg: '280 84% 5%' },
                    { name: 'Orange', primary: '25 95% 53%', bg: '20 14% 4%' },
                    { name: 'Rose', primary: '346 77% 50%', bg: '0 0% 4%' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateSettings({ 
                        primaryColor: preset.primary, 
                        backgroundColor: preset.bg 
                      })}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-light border border-border rounded-lg hover:border-primary transition-all"
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${preset.primary})` }}
                      />
                      <span className="text-sm font-semibold text-foreground">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Branding Settings */}
          <TabsContent value="branding" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Logo & Favicon
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    App Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-surface-light border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </button>
                      {settings.logoUrl && (
                        <button
                          onClick={() => updateSettings({ logoUrl: null })}
                          className="text-sm text-accent-red hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Supports PNG, JPG. Recommended: 512x512px</p>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Favicon
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-surface-light border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden">
                      {settings.faviconUrl ? (
                        <img src={settings.faviconUrl} alt="Favicon" className="w-12 h-12 object-contain" />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/x-icon"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('favicon', e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        onClick={() => faviconInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Favicon
                      </button>
                      {settings.faviconUrl && (
                        <button
                          onClick={() => updateSettings({ faviconUrl: null })}
                          className="text-sm text-accent-red hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Supports PNG, JPG, ICO. Recommended: 32x32px or 64x64px</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Navigation Settings */}
          <TabsContent value="navigation" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                Navigation Buttons
              </h3>
              
              <div className="space-y-4">
                {settings.navButtons.map((btn) => (
                  <div
                    key={btn.id}
                    className="flex items-center gap-4 p-4 bg-surface-light border border-border rounded-xl"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          Button Label
                        </label>
                        <input
                          type="text"
                          value={btn.label}
                          onChange={(e) => updateNavButton(btn.id, { label: e.target.value })}
                          className="bg-input border border-border text-foreground px-3 py-2 rounded-lg w-full outline-none text-sm font-semibold transition-all focus:border-primary"
                        />
                      </div>
                      
                      <div className="flex items-end gap-4">
                        <div className="flex items-center gap-2">
                          {btn.visible ? (
                            <Eye className="w-4 h-4 text-primary" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                          <Switch
                            checked={btn.visible}
                            onCheckedChange={(checked) => updateNavButton(btn.id, { visible: checked })}
                          />
                          <span className="text-sm text-muted-foreground">
                            {btn.visible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Categories Settings */}
          <TabsContent value="categories" className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  Category Management
                </h3>
                <button
                  onClick={() => setShowCategoryDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              <div className="space-y-3">
                {allCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-4 bg-surface-light border border-border rounded-xl group"
                  >
                    {editingCategory === category ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="bg-input border border-border text-foreground px-3 py-2 rounded-lg flex-1 outline-none text-sm font-semibold focus:border-primary"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameCategory(category, editCategoryName);
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                        />
                        <button
                          onClick={() => handleRenameCategory(category, editCategoryName)}
                          className="p-2 bg-primary text-primary-foreground rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <FolderOpen className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-foreground">{category}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {inventory[category]?.length || 0} items
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setEditCategoryName(category);
                            }}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                          >
                            <Type className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="p-2 text-muted-foreground hover:text-accent-red rounded-lg hover:bg-accent-red/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary font-extrabold uppercase tracking-wide">
              Add New Category
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold transition-all focus:border-primary"
                placeholder="Enter category name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                    setShowCategoryDialog(false);
                  }
                }}
              />
            </div>
            
            <button
              onClick={() => {
                handleAddCategory();
                setShowCategoryDialog(false);
              }}
              className="w-full bg-primary text-primary-foreground font-extrabold rounded-xl py-4 text-sm transition-all hover:bg-primary/90 uppercase tracking-wide"
            >
              Add Category
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap with BillingProvider so useBilling hook works
export default function Settings() {
  return (
    <BillingProvider>
      <SettingsPage />
    </BillingProvider>
  );
}
