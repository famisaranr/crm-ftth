'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useMobileMenu } from '@/components/MobileMenuContext';

// Define the 12 system roles from the spec
type Role = 
    | 'SUPER_ADMIN' 
    | 'SYSTEM_ADMIN' 
    | 'MANAGER_CX' 
    | 'MANAGER_NOC' 
    | 'MANAGER_FINANCE' 
    | 'AGENT_CX' 
    | 'AGENT_TECH' 
    | 'AGENT_BILLING' 
    | 'FIELD_TECH' 
    | 'PARTNER_ADMIN' 
    | 'B2B_PORTAL_USER' 
    | 'SYSTEM_SERVICE';

interface NavItem {
    href: string;
    icon: string;
    label: string;
    allowedRoles: Role[];
}

interface NavSection {
    section: string;
    items: NavItem[];
}

// Access Control List for Navigation
const navItems: NavSection[] = [
    { section: 'OVERVIEW', items: [
        { href: '/dashboard', icon: '📊', label: 'Dashboard', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_CX', 'MANAGER_NOC', 'MANAGER_FINANCE', 'AGENT_CX', 'AGENT_TECH', 'AGENT_BILLING', 'PARTNER_ADMIN'] },
        { href: '/dashboard/barangay', icon: '🏘️', label: 'Bgy Dashboard', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_CX', 'PARTNER_ADMIN'] },
        { href: '/dashboard/finance', icon: '📈', label: 'Finance Board', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_FINANCE'] },
        { href: '/dashboard/network', icon: '🔌', label: 'NOC Board', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_NOC'] },
    ]},
    { section: 'OPERATIONS', items: [
        { href: '/subscribers', icon: '👥', label: 'Subscribers', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_CX', 'AGENT_CX', 'MANAGER_NOC', 'AGENT_TECH', 'MANAGER_FINANCE', 'AGENT_BILLING'] },
        { href: '/network', icon: '🔌', label: 'Network', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_NOC', 'AGENT_TECH'] },
        { href: '/network/topology', icon: '🕸️', label: 'Topology', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_NOC', 'AGENT_TECH'] },
        { href: '/installations', icon: '🔧', label: 'Installations', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_NOC', 'AGENT_TECH', 'FIELD_TECH'] },
        { href: '/tickets', icon: '🎫', label: 'Tickets', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_CX', 'AGENT_CX', 'MANAGER_NOC', 'AGENT_TECH', 'FIELD_TECH'] },
        { href: '/tickets/dispatch', icon: '🚚', label: 'Dispatch', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_NOC', 'AGENT_TECH'] },
    ]},
    { section: 'FINANCE', items: [
        { href: '/billing', icon: '💰', label: 'Billing', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_FINANCE', 'AGENT_BILLING'] },
        { href: '/billing/suspensions', icon: '⏸', label: 'Suspensions', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_FINANCE', 'AGENT_BILLING'] },
        { href: '/billing/aging', icon: '⏳', label: 'Aging Report', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_FINANCE'] },
        { href: '/payments', icon: '💳', label: 'Payments', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_FINANCE', 'AGENT_BILLING'] },
        { href: '/settlements', icon: '🤝', label: 'Settlements', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_FINANCE'] },
        { href: '/settlements/statements', icon: '📄', label: 'Statements', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_FINANCE', 'PARTNER_ADMIN'] },
    ]},
    { section: 'ANALYTICS', items: [
        { href: '/reports', icon: '📈', label: 'Reports', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_CX', 'MANAGER_FINANCE', 'PARTNER_ADMIN'] },
        { href: '/reports/kpi', icon: '🎯', label: 'KPIs', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_CX', 'MANAGER_FINANCE'] },
        { href: '/maps', icon: '🗺️', label: 'Network Map', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_NOC', 'MANAGER_CX', 'PARTNER_ADMIN'] },
    ]},
    { section: 'ADMIN', items: [
        { href: '/admin/users', icon: '👤', label: 'Users', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
        { href: '/admin/roles', icon: '🔐', label: 'Roles', allowedRoles: ['SUPER_ADMIN'] },
        { href: '/admin/plans', icon: '📝', label: 'Plans', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER_FINANCE'] },
        { href: '/admin/barangays', icon: '🏘️', label: 'Barangays', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
        { href: '/admin/partners', icon: '🤝', label: 'Partners', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
        { href: '/admin/settings', icon: '⚙️', label: 'Settings', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
        { href: '/admin/audit', icon: '📋', label: 'Audit Logs', allowedRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] },
    ]},
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { isOpen, close } = useMobileMenu();
    
    // Default to SUPER_ADMIN for UI dev if not logged in yet but somehow viewing protected layout
    const userRole = (user?.role || 'SUPER_ADMIN') as Role;

    // Filter navigation based on user role
    const visibleNav = navItems.map(section => ({
        ...section,
        items: section.items.filter(item => item.allowedRoles.includes(userRole))
    })).filter(section => section.items.length > 0);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo" style={{ whiteSpace: 'nowrap', fontSize: '16px' }}>
                🌐 Fiber<span>Ops</span> PH
            </div>
            <nav className="sidebar-nav">
                {visibleNav.map((section) => (
                    <div key={section.section}>
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={close}
                                className={`nav-item ${pathname?.startsWith(item.href) ? 'active' : ''}`}
                            >
                                <span className="nav-item-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                v1.0.0 · {userRole.replace('_', ' ')}
            </div>
        </aside>
    );
}
