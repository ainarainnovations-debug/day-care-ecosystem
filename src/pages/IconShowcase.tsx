import { 
  Heart, 
  User, 
  Bell, 
  Settings, 
  Calendar, 
  MapPin,
  Check,
  X,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Building2,
  Users,
  DollarSign,
  Star,
  Baby,
  BookOpen,
  Coffee,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Icon, IconBadge, IconButton, ICON_SIZES, ICON_VARIANTS } from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationTester } from '@/components/NotificationTester';

const IconShowcase = () => {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Icon System & Dev Tools</h1>
        <p className="text-muted-foreground">
          Consistent, scalable icons with unified styling across the day-care ecosystem
        </p>
      </div>

      {/* Notification Tester */}
      <NotificationTester />

      {/* Size Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Sizes</CardTitle>
          <CardDescription>Standard sizes from xs to 2xl</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="text-center space-y-2">
              <Icon icon={Heart} size="xs" variant="primary" />
              <p className="text-xs text-muted-foreground">xs (12px)</p>
            </div>
            <div className="text-center space-y-2">
              <Icon icon={Heart} size="sm" variant="primary" />
              <p className="text-xs text-muted-foreground">sm (16px)</p>
            </div>
            <div className="text-center space-y-2">
              <Icon icon={Heart} size="md" variant="primary" />
              <p className="text-xs text-muted-foreground">md (20px)</p>
            </div>
            <div className="text-center space-y-2">
              <Icon icon={Heart} size="lg" variant="primary" />
              <p className="text-xs text-muted-foreground">lg (24px)</p>
            </div>
            <div className="text-center space-y-2">
              <Icon icon={Heart} size="xl" variant="primary" />
              <p className="text-xs text-muted-foreground">xl (32px)</p>
            </div>
            <div className="text-center space-y-2">
              <Icon icon={Heart} size="2xl" variant="primary" />
              <p className="text-xs text-muted-foreground">2xl (48px)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variant Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Variants</CardTitle>
          <CardDescription>Color variants for different contexts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <Icon icon={User} size="lg" variant="default" />
              <div>
                <p className="font-medium text-sm">Default</p>
                <p className="text-xs text-muted-foreground">Foreground color</p>
              </div>
            </div>
            <div className="space-y-3">
              <Icon icon={Heart} size="lg" variant="primary" />
              <div>
                <p className="font-medium text-sm">Primary</p>
                <p className="text-xs text-muted-foreground">Brand color</p>
              </div>
            </div>
            <div className="space-y-3">
              <Icon icon={Shield} size="lg" variant="secondary" />
              <div>
                <p className="font-medium text-sm">Secondary</p>
                <p className="text-xs text-muted-foreground">Secondary theme</p>
              </div>
            </div>
            <div className="space-y-3">
              <Icon icon={Star} size="lg" variant="accent" />
              <div>
                <p className="font-medium text-sm">Accent</p>
                <p className="text-xs text-muted-foreground">Accent color</p>
              </div>
            </div>
            <div className="space-y-3">
              <Icon icon={Clock} size="lg" variant="muted" />
              <div>
                <p className="font-medium text-sm">Muted</p>
                <p className="text-xs text-muted-foreground">Subtle color</p>
              </div>
            </div>
            <div className="space-y-3">
              <Icon icon={Check} size="lg" variant="success" />
              <div>
                <p className="font-medium text-sm">Success</p>
                <p className="text-xs text-muted-foreground">Green confirmation</p>
              </div>
            </div>
            <div className="space-y-3">
              <Icon icon={AlertTriangle} size="lg" variant="warning" />
              <div>
                <p className="font-medium text-sm">Warning</p>
                <p className="text-xs text-muted-foreground">Yellow caution</p>
              </div>
            </div>
            <div className="space-y-3">
              <Icon icon={X} size="lg" variant="danger" />
              <div>
                <p className="font-medium text-sm">Danger</p>
                <p className="text-xs text-muted-foreground">Red destructive</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Icon Badges (with background) */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Badges</CardTitle>
          <CardDescription>Icons with colored backgrounds - perfect for cards and lists</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Different sizes with backgrounds */}
            <div>
              <h3 className="text-sm font-medium mb-3">Sizes with Background</h3>
              <div className="flex items-center gap-3">
                <IconBadge icon={Bell} size="sm" variant="primary" rounded="full" />
                <IconBadge icon={Mail} size="md" variant="primary" rounded="full" />
                <IconBadge icon={Calendar} size="lg" variant="primary" rounded="full" />
                <IconBadge icon={Settings} size="xl" variant="primary" rounded="full" />
              </div>
            </div>

            {/* Different variants with backgrounds */}
            <div>
              <h3 className="text-sm font-medium mb-3">Variants with Background</h3>
              <div className="flex flex-wrap gap-3">
                <IconBadge icon={User} size="lg" variant="default" rounded="full" />
                <IconBadge icon={Heart} size="lg" variant="primary" rounded="full" />
                <IconBadge icon={Shield} size="lg" variant="secondary" rounded="full" />
                <IconBadge icon={Star} size="lg" variant="accent" rounded="full" />
                <IconBadge icon={Clock} size="lg" variant="muted" rounded="full" />
                <IconBadge icon={Check} size="lg" variant="success" rounded="full" />
                <IconBadge icon={AlertTriangle} size="lg" variant="warning" rounded="full" />
                <IconBadge icon={X} size="lg" variant="danger" rounded="full" />
              </div>
            </div>

            {/* Different rounded styles */}
            <div>
              <h3 className="text-sm font-medium mb-3">Rounded Styles</h3>
              <div className="flex items-center gap-3">
                <IconBadge icon={MapPin} size="lg" variant="primary" rounded="none" />
                <IconBadge icon={MapPin} size="lg" variant="primary" rounded="sm" />
                <IconBadge icon={MapPin} size="lg" variant="primary" rounded="md" />
                <IconBadge icon={MapPin} size="lg" variant="primary" rounded="lg" />
                <IconBadge icon={MapPin} size="lg" variant="primary" rounded="full" />
              </div>
              <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                <span>none</span>
                <span className="ml-8">sm</span>
                <span className="ml-10">md</span>
                <span className="ml-10">lg</span>
                <span className="ml-9">full</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Icon Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Buttons</CardTitle>
          <CardDescription>Interactive icons with hover states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <IconButton icon={Bell} size="md" variant="default" onClick={() => alert('Notification clicked!')} />
            <IconButton icon={Settings} size="md" variant="muted" onClick={() => alert('Settings clicked!')} />
            <IconButton icon={Heart} size="md" variant="primary" onClick={() => alert('Favorite clicked!')} />
            <IconButton icon={Star} size="md" variant="accent" onClick={() => alert('Star clicked!')} />
            <IconButton icon={Check} size="md" variant="success" onClick={() => alert('Confirm clicked!')} />
            <IconButton icon={X} size="md" variant="danger" onClick={() => alert('Close clicked!')} />
          </div>
        </CardContent>
      </Card>

      {/* Real-world Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Real-World Usage Examples</CardTitle>
          <CardDescription>How to use icons in actual components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Cards */}
          <div>
            <h3 className="text-sm font-medium mb-3">Dashboard Stats Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-popover rounded-xl p-4 border border-border flex items-center gap-3">
                <IconBadge icon={Users} size="lg" variant="primary" rounded="lg" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Total Children</p>
                </div>
              </div>
              <div className="bg-popover rounded-xl p-4 border border-border flex items-center gap-3">
                <IconBadge icon={DollarSign} size="lg" variant="success" rounded="lg" />
                <div>
                  <p className="text-2xl font-bold">$2,450</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
              <div className="bg-popover rounded-xl p-4 border border-border flex items-center gap-3">
                <IconBadge icon={TrendingUp} size="lg" variant="accent" rounded="lg" />
                <div>
                  <p className="text-2xl font-bold">+12%</p>
                  <p className="text-sm text-muted-foreground">Growth</p>
                </div>
              </div>
            </div>
          </div>

          {/* List Items */}
          <div>
            <h3 className="text-sm font-medium mb-3">List Items with Icons</h3>
            <div className="space-y-2">
              <div className="bg-popover rounded-xl p-3 border border-border flex items-center gap-3">
                <IconBadge icon={Mail} size="md" variant="primary" rounded="full" />
                <div>
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-xs text-muted-foreground">parent@example.com</p>
                </div>
              </div>
              <div className="bg-popover rounded-xl p-3 border border-border flex items-center gap-3">
                <IconBadge icon={Phone} size="md" variant="accent" rounded="full" />
                <div>
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-xs text-muted-foreground">(555) 123-4567</p>
                </div>
              </div>
              <div className="bg-popover rounded-xl p-3 border border-border flex items-center gap-3">
                <IconBadge icon={Building2} size="md" variant="secondary" rounded="full" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-xs text-muted-foreground">123 Main St, City</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div>
            <h3 className="text-sm font-medium mb-3">Feature Grid</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <IconBadge icon={Baby} size="xl" variant="primary" rounded="lg" />
                </div>
                <p className="text-sm font-medium">Infant Care</p>
                <p className="text-xs text-muted-foreground">Ages 0-1</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <IconBadge icon={BookOpen} size="xl" variant="accent" rounded="lg" />
                </div>
                <p className="text-sm font-medium">Learning</p>
                <p className="text-xs text-muted-foreground">Education</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <IconBadge icon={Coffee} size="xl" variant="success" rounded="lg" />
                </div>
                <p className="text-sm font-medium">Meals</p>
                <p className="text-xs text-muted-foreground">3 daily</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <IconBadge icon={Shield} size="xl" variant="warning" rounded="lg" />
                </div>
                <p className="text-sm font-medium">Safety</p>
                <p className="text-xs text-muted-foreground">Certified</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>Copy-paste ready code snippets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Basic Icon:</p>
            <code className="block bg-secondary p-3 rounded text-xs">
              {'<Icon icon={Heart} size="md" variant="primary" />'}
            </code>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Icon with Background:</p>
            <code className="block bg-secondary p-3 rounded text-xs">
              {'<IconBadge icon={Bell} size="lg" variant="primary" rounded="full" />'}
            </code>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Interactive Icon Button:</p>
            <code className="block bg-secondary p-3 rounded text-xs">
              {'<IconButton icon={Settings} size="md" variant="muted" onClick={() => handleClick()} />'}
            </code>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Using Constants:</p>
            <code className="block bg-secondary p-3 rounded text-xs">
              {'<Icon icon={Star} size={ICON_SIZES.LG} variant={ICON_VARIANTS.ACCENT} />'}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconShowcase;
