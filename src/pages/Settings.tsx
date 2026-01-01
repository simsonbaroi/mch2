import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  RotateCcw, 
  Settings as SettingsIcon,
  Image,
  Navigation,
  Grid3X3,
  Palette,
  Plus,
  Trash2,
  GripVertical,
  Pill,
  Thermometer,
  Heart,
  Wind,
  Apple,
  Sparkles,
  Stethoscope,
  FlaskConical,
  Home,
  UserCheck,
  BedDouble,
  Tags,
  Activity,
  Syringe,
  TestTube,
  Bandage,
  Brain,
  Eye,
  Ear,
  Bone,
  Baby,
  Droplets,
  Zap,
  Shield,
  Leaf,
  Moon,
  Sun,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';
import { useAppSettings, NavButtonConfig } from '@/contexts/AppSettingsContext';
import { LocalBillingProvider, useLocalBilling } from '@/contexts/LocalBillingContext';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icon options for categories and nav buttons
const iconOptions = [
  { value: 'Pill', label: 'Pill', icon: Pill },
  { value: 'Thermometer', label: 'Thermometer', icon: Thermometer },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Wind', label: 'Wind', icon: Wind },
  { value: 'Apple', label: 'Apple', icon: Apple },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'Stethoscope', label: 'Stethoscope', icon: Stethoscope },
  { value: 'FlaskConical', label: 'FlaskConical', icon: FlaskConical },
  { value: 'Home', label: 'Home', icon: Home },
  { value: 'UserCheck', label: 'UserCheck', icon: UserCheck },
  { value: 'BedDouble', label: 'BedDouble', icon: BedDouble },
  { value: 'Tags', label: 'Tags', icon: Tags },
  { value: 'Activity', label: 'Activity', icon: Activity },
  { value: 'Syringe', label: 'Syringe', icon: Syringe },
  { value: 'TestTube', label: 'TestTube', icon: TestTube },
  { value: 'Bandage', label: 'Bandage', icon: Bandage },
  { value: 'Brain', label: 'Brain', icon: Brain },
  { value: 'Eye', label: 'Eye', icon: Eye },
  { value: 'Ear', label: 'Ear', icon: Ear },
  { value: 'Bone', label: 'Bone', icon: Bone },
  { value: 'Baby', label: 'Baby', icon: Baby },
  { value: 'Droplets', label: 'Droplets', icon: Droplets },
  { value: 'Zap', label: 'Zap', icon: Zap },
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Leaf', label: 'Leaf', icon: Leaf },
];

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(i => i.value === iconName);
  return found ? found.icon : Pill;
};

// Color picker with gradient sliders
const ColorSlider = ({ 
  label, 
  value, 
  onChange,
  colorPreview
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  colorPreview: string;
}) => {
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

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <div 
          className="w-10 h-10 rounded-full border-2 border-border shadow-lg"
          style={{ backgroundColor: colorPreview }}
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Hue</span>
            <span>{Math.round(h)}°</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
          }}>
            <Slider
              value={[h]}
              onValueChange={([v]) => handleChange('h', v)}
              max={360}
              step={1}
              className="absolute inset-0"
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Saturation</span>
            <span>{Math.round(s)}%</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{
            background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`
          }}>
            <Slider
              value={[s]}
              onValueChange={([v]) => handleChange('s', v)}
              max={100}
              step={1}
              className="absolute inset-0"
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Lightness</span>
            <span>{Math.round(l)}%</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{
            background: `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`
          }}>
            <Slider
              value={[l]}
              onValueChange={([v]) => handleChange('l', v)}
              max={100}
              step={1}
              className="absolute inset-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Category type
interface CategoryConfig {
  name: string;
  icon: string;
  type: 'both' | 'outpatient' | 'inpatient';
  enabled: boolean;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, updateNavButton, resetSettings } = useAppSettings();
  const { inventory } = useLocalBilling();
  const { user, isLoading } = useLocalAuthContext();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'outpatient' | 'inpatient'>('all');
  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    const cats = Object.keys(inventory);
    return cats.map(name => ({
      name,
      icon: 'Pill',
      type: 'both' as const,
      enabled: true
    }));
  });

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Extended color settings
  const [colorSettings, setColorSettings] = useState({
    primary: settings.primaryColor,
    secondary: '160 30% 20%',
    accent: settings.accentColor,
    background: settings.backgroundColor,
    foreground: '160 20% 95%',
    muted: '180 15% 15%',
    destructive: '0 62% 50%',
  });

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

  const handleAddNavButton = () => {
    const newButton: NavButtonConfig = {
      id: `nav-${Date.now()}`,
      label: 'NEW BUTTON',
      icon: 'Home',
      visible: true
    };
    updateSettings({
      navButtons: [...settings.navButtons, newButton]
    });
    toast.success('Button added');
  };

  const handleDeleteNavButton = (id: string) => {
    updateSettings({
      navButtons: settings.navButtons.filter(btn => btn.id !== id)
    });
    toast.success('Button removed');
  };

  const handleAddCategory = () => {
    const newCat: CategoryConfig = {
      name: 'New Category',
      icon: 'Pill',
      type: 'both',
      enabled: true
    };
    setCategories([...categories, newCat]);
    toast.success('Category added (local only - add items via Price List to persist)');
  };

  const handleUpdateCategory = (index: number, updates: Partial<CategoryConfig>) => {
    const newCats = [...categories];
    newCats[index] = { ...newCats[index], ...updates };
    setCategories(newCats);
  };

  const handleDeleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
    toast.success('Category removed from view');
  };

  const handleColorChange = (key: keyof typeof colorSettings, value: string) => {
    setColorSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply to app settings
    if (key === 'primary') updateSettings({ primaryColor: value });
    if (key === 'accent') updateSettings({ accentColor: value });
    if (key === 'background') updateSettings({ backgroundColor: value });
  };

  const resetColors = () => {
    const defaults = {
      primary: '160 84% 39%',
      secondary: '160 30% 20%',
      accent: '160 60% 45%',
      background: '180 20% 8%',
      foreground: '160 20% 95%',
      muted: '180 15% 15%',
      destructive: '0 62% 50%',
    };
    setColorSettings(defaults);
    updateSettings({
      primaryColor: defaults.primary,
      accentColor: defaults.accent,
      backgroundColor: defaults.background
    });
    toast.success('Colors reset');
  };

  const filteredCategories = categories.filter(cat => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'outpatient') return cat.type === 'outpatient' || cat.type === 'both';
    if (categoryFilter === 'inpatient') return cat.type === 'inpatient' || cat.type === 'both';
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Settings</span>
            </div>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* App Information */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            App Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">App Name</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => updateSettings({ appName: e.target.value })}
                className="bg-surface border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">App Subtitle</label>
              <input
                type="text"
                value={settings.appSubtitle}
                onChange={(e) => updateSettings({ appSubtitle: e.target.value })}
                className="bg-surface border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Logo (PNG/JPG)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-surface border border-border rounded-xl flex items-center justify-center overflow-hidden">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Image className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Favicon (PNG/JPG)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-surface border border-border rounded-xl flex items-center justify-center overflow-hidden">
                  {settings.faviconUrl ? (
                    <img src={settings.faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" />
                  ) : (
                    <Image className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('favicon', e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => faviconInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Buttons */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              Navigation Buttons
            </h2>
            <button
              onClick={handleAddNavButton}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Button
            </button>
          </div>
          
          <div className="space-y-3">
            {settings.navButtons.map((btn) => {
              const IconComp = getIconComponent(btn.icon);
              return (
                <div key={btn.id} className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  <input
                    type="text"
                    value={btn.label}
                    onChange={(e) => updateNavButton(btn.id, { label: e.target.value })}
                    className="flex-1 bg-surface-light border border-border text-foreground px-3 py-2 rounded-lg outline-none font-medium transition-all focus:border-primary"
                  />
                  
                  <Select
                    value={btn.icon}
                    onValueChange={(value) => updateNavButton(btn.id, { icon: value })}
                  >
                    <SelectTrigger className="w-40 bg-surface-light border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {iconOptions.slice(8, 12).map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={btn.visible}
                      onCheckedChange={(checked) => updateNavButton(btn.id, { visible: checked })}
                    />
                    <span className="text-sm text-muted-foreground">Visible</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Categories */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-primary" />
              Categories
            </h2>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
            <TabsList className="bg-surface border border-border p-1 rounded-xl w-full">
              <TabsTrigger value="all" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All ({categories.length})
              </TabsTrigger>
              <TabsTrigger value="outpatient" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Outpatient
              </TabsTrigger>
              <TabsTrigger value="inpatient" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Inpatient
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-3">
            {filteredCategories.map((cat, idx) => {
              const IconComp = getIconComponent(cat.icon);
              const realIdx = categories.findIndex(c => c.name === cat.name);
              return (
                <div key={cat.name} className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
                  <button className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <IconComp className="w-5 h-5 text-primary" />
                  </button>
                  
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleUpdateCategory(realIdx, { name: e.target.value })}
                    className="flex-1 bg-surface-light border border-border text-foreground px-3 py-2 rounded-lg outline-none font-medium transition-all focus:border-primary"
                  />
                  
                  <Select
                    value={cat.icon}
                    onValueChange={(value) => handleUpdateCategory(realIdx, { icon: value })}
                  >
                    <SelectTrigger className="w-36 bg-surface-light border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-60">
                      {iconOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={cat.type}
                    onValueChange={(value) => handleUpdateCategory(realIdx, { type: value as any })}
                  >
                    <SelectTrigger className="w-32 bg-surface-light border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="outpatient">Outpatient</SelectItem>
                      <SelectItem value="inpatient">Inpatient</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Switch
                    checked={cat.enabled}
                    onCheckedChange={(checked) => handleUpdateCategory(realIdx, { enabled: checked })}
                  />
                  
                  <button
                    onClick={() => handleDeleteCategory(realIdx)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Color Theme */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Color Theme
            </h2>
            <button
              onClick={resetColors}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Colors
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorSlider
              label="Primary (Main Brand)"
              value={colorSettings.primary}
              onChange={(v) => handleColorChange('primary', v)}
              colorPreview={`hsl(${colorSettings.primary})`}
            />
            <ColorSlider
              label="Secondary"
              value={colorSettings.secondary}
              onChange={(v) => handleColorChange('secondary', v)}
              colorPreview={`hsl(${colorSettings.secondary})`}
            />
            <ColorSlider
              label="Accent"
              value={colorSettings.accent}
              onChange={(v) => handleColorChange('accent', v)}
              colorPreview={`hsl(${colorSettings.accent})`}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorSlider
              label="Background"
              value={colorSettings.background}
              onChange={(v) => handleColorChange('background', v)}
              colorPreview={`hsl(${colorSettings.background})`}
            />
            <ColorSlider
              label="Text/Foreground"
              value={colorSettings.foreground}
              onChange={(v) => handleColorChange('foreground', v)}
              colorPreview={`hsl(${colorSettings.foreground})`}
            />
            <ColorSlider
              label="Muted/Subtle"
              value={colorSettings.muted}
              onChange={(v) => handleColorChange('muted', v)}
              colorPreview={`hsl(${colorSettings.muted})`}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorSlider
              label="Destructive/Error"
              value={colorSettings.destructive}
              onChange={(v) => handleColorChange('destructive', v)}
              colorPreview={`hsl(${colorSettings.destructive})`}
            />
          </div>

          {/* Preview */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
            <span className="text-sm font-bold text-foreground">Preview</span>
            <div className="flex flex-wrap gap-3">
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: `hsl(${colorSettings.primary})`, color: 'white' }}
              >
                Primary Button
              </button>
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm border"
                style={{ 
                  backgroundColor: `hsl(${colorSettings.secondary})`,
                  borderColor: `hsl(${colorSettings.secondary})`,
                  color: 'white'
                }}
              >
                Secondary
              </button>
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: `hsl(${colorSettings.accent})`, color: 'white' }}
              >
                Accent
              </button>
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: `hsl(${colorSettings.muted})`, color: `hsl(${colorSettings.foreground})` }}
              >
                Muted
              </button>
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: `hsl(${colorSettings.destructive})`, color: 'white' }}
              >
                Destructive
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

// Wrap with LocalBillingProvider so useLocalBilling hook works
export default function Settings() {
  return (
    <LocalBillingProvider>
      <SettingsPage />
    </LocalBillingProvider>
  );
}
