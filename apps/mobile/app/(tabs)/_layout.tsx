import { Tabs } from 'expo-router';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react-native';
import { colors, font } from '../../lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor:  colors.border,
          borderTopWidth:  1,
          height:          60,
          paddingBottom:   8,
        },
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.foregroundMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Discover', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }} />
      <Tabs.Screen name="browse"   options={{ title: 'Browse',   tabBarIcon: ({ color }) => <Search size={22} color={color} /> }} />
      <Tabs.Screen name="create"   options={{
        title: 'List',
        tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
        tabBarItemStyle: { marginTop: -4 },
      }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} /> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile',  tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}
