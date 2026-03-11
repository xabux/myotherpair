import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin, ShoppingBag, MessageCircle, Settings,
  LogOut, ChevronRight, Edit,
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, font, shadow } from '../../lib/theme';

interface Profile {
  name?: string;
  email?: string;
  avatar_url?: string;
  location?: string;
  foot_size_left?: number | null;
  foot_size_right?: number | null;
  is_amputee?: boolean;
  bio?: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile,  setProfile]  = useState<Profile>({});
  const [loading,  setLoading]  = useState(true);
  const [listings, setListings] = useState(0);
  const [matches,  setMatches]  = useState(0);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.replace('/login'); return; }
    const uid = session.user.id;

    const [profileRes, listingsRes, matchesRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', uid).single(),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'active'),
      supabase.from('matches').select('id', { count: 'exact', head: true }).or(`user_id_1.eq.${uid},user_id_2.eq.${uid}`),
    ]);

    if (profileRes.data) setProfile(profileRes.data as Profile);
    setListings(listingsRes.count ?? 0);
    setMatches(matchesRes.count ?? 0);
    setLoading(false);
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => {
        await supabase.auth.signOut();
        router.replace('/login');
      }},
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  const name    = profile.name ?? '';
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  function MenuItem({ icon, label, value, onPress, destructive }: {
    icon: React.ReactNode; label: string; value?: string; onPress?: () => void; destructive?: boolean;
  }) {
    return (
      <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[s.menuIcon, destructive && { backgroundColor: colors.destructive + '18' }]}>
          {icon}
        </View>
        <Text style={[s.menuLabel, destructive && { color: colors.destructive }]}>{label}</Text>
        {value && <Text style={s.menuValue}>{value}</Text>}
        <ChevronRight size={16} color={destructive ? colors.destructive : colors.foregroundMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* User card */}
        <View style={s.userCard}>
          <View style={s.avatarArea}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
            ) : (
              <View style={s.avatarPlaceholder}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={s.onlineDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{name || 'No name set'}</Text>
            {profile.location ? (
              <View style={s.locationRow}>
                <MapPin size={12} color={colors.foregroundMuted} />
                <Text style={s.locationText}>{profile.location}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity onPress={() => router.push('/edit-profile' as any)} style={s.editBtn}>
            <Edit size={16} color={colors.foregroundMuted} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: 'Listings', value: listings },
            { label: 'Matches',  value: matches },
            { label: 'Left',     value: profile.foot_size_left  ? `UK ${profile.foot_size_left}`  : '—' },
            { label: 'Right',    value: profile.foot_size_right ? `UK ${profile.foot_size_right}` : '—' },
          ].map((stat, i) => (
            <View key={i} style={s.statCell}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        {profile.bio ? (
          <View style={s.bio}>
            <Text style={s.bioLabel}>Searching for</Text>
            <Text style={s.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* Menu */}
        <View style={s.section}>
          <MenuItem icon={<ShoppingBag size={18} color={colors.foregroundMuted} />} label="My listings" value={`${listings}`} />
          <View style={s.divider} />
          <MenuItem icon={<MessageCircle size={18} color={colors.foregroundMuted} />} label="My matches" value={`${matches}`} onPress={() => router.push('/(tabs)/messages' as any)} />
        </View>

        <View style={s.section}>
          <MenuItem icon={<Edit size={18} color={colors.foregroundMuted} />} label="Edit profile" onPress={() => router.push('/edit-profile' as any)} />
          <View style={s.divider} />
          <MenuItem icon={<Settings size={18} color={colors.foregroundMuted} />} label="Settings" />
        </View>

        <View style={s.section}>
          <MenuItem
            icon={<LogOut size={18} color={colors.destructive} />}
            label="Sign out"
            onPress={handleSignOut}
            destructive
          />
        </View>

        <Text style={s.footer}>MyOtherPair · Every shoe deserves a match.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:              { flex: 1, backgroundColor: colors.background },
  header:            { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle:       { fontSize: font.xl, fontWeight: '700', color: colors.foreground },
  scroll:            { padding: spacing.md, paddingBottom: 100 },
  userCard:          { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...shadow.card },
  avatarArea:        { position: 'relative' },
  avatar:            { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent + '33', alignItems: 'center', justifyContent: 'center' },
  avatarInitials:    { fontSize: font.xl, fontWeight: '700', color: colors.accent },
  onlineDot:         { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.matchGreen, borderWidth: 2, borderColor: colors.card },
  name:              { fontSize: font.lg, fontWeight: '700', color: colors.foreground },
  locationRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText:      { fontSize: font.xs, color: colors.foregroundMuted },
  editBtn:           { padding: 8 },
  statsRow:          { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
  statCell:          { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRightWidth: 1, borderRightColor: colors.border },
  statValue:         { fontSize: font.md, fontWeight: '700', color: colors.foreground },
  statLabel:         { fontSize: 9, color: colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
  bio:               { backgroundColor: colors.accent + '0C', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.accent + '22', padding: spacing.md, marginBottom: spacing.md },
  bioLabel:          { fontSize: font.xs, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 4 },
  bioText:           { fontSize: font.sm, color: colors.foreground, lineHeight: 20 },
  section:           { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
  menuItem:          { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  menuIcon:          { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.border + '66', alignItems: 'center', justifyContent: 'center' },
  menuLabel:         { flex: 1, fontSize: font.base, color: colors.foreground, fontWeight: '500' },
  menuValue:         { fontSize: font.sm, color: colors.foregroundMuted, marginRight: 4 },
  divider:           { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  footer:            { textAlign: 'center', fontSize: font.xs, color: colors.foregroundMuted + '66', marginTop: spacing.lg, letterSpacing: 0.5 },
});
