import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Invitation {
  id: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  clicks: number;
  registrations: number;
  rewardsClaimed: number;
}

export interface UserInviteStats {
  totalClicks: number;
  totalRegistrations: number;
  totalRewardsClaimed: number;
  invitationLinks: Invitation[];
}

interface UserState {
  // User authentication
  isLoggedIn: boolean;
  userInfo: {
    username: string;
    email: string;
  } | null;
  
  // User usage counters and limits
  usageRemaining: number;
  lastReset: string | null;
  
  // Invitation tracking
  userInviteStats: UserInviteStats;
  userInviteCode: string;
  
  // Week limit tracking
  weeklyClickRewards: number;
  weekStart: string | null;
  
  // Methods
  login: (username: string, email: string) => void;
  logout: () => void;
  decrementUsage: () => void;
  addUsageFromInvite: (amount: number) => void;
  addUsageFromClick: () => void;
  resetMonthlyUsage: () => void;
  generateInviteCode: () => string;
  registerClick: (inviteCode: string) => void;
  registerInvite: (inviteCode: string) => void;
  checkAndResetWeeklyLimit: () => void;
}

/**
 * Generates a unique invite code for the user
 */
function generateUniqueCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Gets the beginning of the current week (Sunday)
 */
function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek.toISOString();
}

/**
 * Check if a date is in the current month
 */
function isCurrentMonth(dateString: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && 
         date.getFullYear() === now.getFullYear();
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoggedIn: false,
      userInfo: null,
      usageRemaining: 10, // Default initial usage amount
      lastReset: null,
      userInviteCode: generateUniqueCode(),
      userInviteStats: {
        totalClicks: 0,
        totalRegistrations: 0,
        totalRewardsClaimed: 0,
        invitationLinks: []
      },
      weeklyClickRewards: 0,
      weekStart: null,
      
      // Login method
      login: (username: string, email: string) => {
        set({
          isLoggedIn: true,
          userInfo: { username, email }
        });
      },
      
      // Logout method
      logout: () => {
        set({
          isLoggedIn: false,
          userInfo: null
        });
      },
      
      // Decrement usage when content is generated
      decrementUsage: () => {
        const { usageRemaining } = get();
        if (usageRemaining > 0) {
          set({ usageRemaining: usageRemaining - 1 });
        }
      },
      
      // Add usage from successful invite
      addUsageFromInvite: (amount: number) => {
        const { usageRemaining } = get();
        set({ usageRemaining: usageRemaining + amount });
      },
      
      // Add usage from link click (with weekly limit)
      addUsageFromClick: () => {
        const { usageRemaining, weeklyClickRewards } = get();
        
        // Check if under weekly limit
        if (weeklyClickRewards < 100) {
          set({ 
            usageRemaining: usageRemaining + 1,
            weeklyClickRewards: weeklyClickRewards + 1 
          });
        }
      },
      
      // Reset monthly usage at month start
      resetMonthlyUsage: () => {
        // Check if we need to reset based on month
        const { lastReset } = get();
        const now = new Date();
        
        // Reset if first time or if last reset was in a different month
        if (!lastReset || !isCurrentMonth(lastReset)) {
          set({ 
            usageRemaining: 10, // Monthly free amount
            lastReset: now.toISOString() 
          });
        }
      },
      
      // Generate a new invite code
      generateInviteCode: () => {
        const newCode = generateUniqueCode();
        set({ userInviteCode: newCode });
        return newCode;
      },
      
      // Register a click on an invite link
      registerClick: (inviteCode: string) => {
        const { userInviteStats } = get();
        const updatedInvites = userInviteStats.invitationLinks.map(invite => {
          if (invite.code === inviteCode) {
            return { ...invite, clicks: invite.clicks + 1 };
          }
          return invite;
        });
        
        set({
          userInviteStats: {
            ...userInviteStats,
            totalClicks: userInviteStats.totalClicks + 1,
            invitationLinks: updatedInvites
          }
        });
      },
      
      // Register a successful invitation
      registerInvite: (inviteCode: string) => {
        const { userInviteStats } = get();
        const updatedInvites = userInviteStats.invitationLinks.map(invite => {
          if (invite.code === inviteCode) {
            return { 
              ...invite, 
              registrations: invite.registrations + 1,
              rewardsClaimed: invite.rewardsClaimed + 1
            };
          }
          return invite;
        });
        
        set({
          userInviteStats: {
            ...userInviteStats,
            totalRegistrations: userInviteStats.totalRegistrations + 1,
            totalRewardsClaimed: userInviteStats.totalRewardsClaimed + 1,
            invitationLinks: updatedInvites
          }
        });
      },
      
      // Check and reset weekly limit if needed
      checkAndResetWeeklyLimit: () => {
        const { weekStart } = get();
        const currentWeekStart = getCurrentWeekStart();
        
        // If we're in a new week, reset the counter
        if (!weekStart || weekStart !== currentWeekStart) {
          set({ 
            weeklyClickRewards: 0,
            weekStart: currentWeekStart
          });
        }
      }
    }),
    {
      name: 'user-storage', // Name for localStorage
    }
  )
)

// Auto-run checks when the store is initialized
if (typeof window !== 'undefined') {
  const { resetMonthlyUsage, checkAndResetWeeklyLimit } = useUserStore.getState();
  resetMonthlyUsage();
  checkAndResetWeeklyLimit();
}