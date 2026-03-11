import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Image, TouchableOpacity,
  ActivityIndicator, Animated, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, X, Heart, ArrowLeftRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, font, shadow } from '../../lib/theme';

const { width: W, height: H } = Dimensions.get('window');
const CARD_W = W - spacing.lg * 2;

interface Listing {
  id: string;
  shoe_brand: string;
  shoe_model: string;
  size: number;
  foot_side: string;
  condition: string;
  price: number;
  photos: string[];
  seller_name?: string;
  seller_location?: string;
}

const CONDITION_LABEL: Record<string, string> = {
  new_with_tags: 'New (tags on)', new_without_tags: 'New',
  excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor',
};

export default function DiscoverScreen() {
  const [listings,  setListings]  = useState<Listing[]>([]);
  const [index,     setIndex]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [userId,    setUserId]    = useState<string | null>(null);

  const position   = useRef(new Animated.ValueXY()).current;
  const rotateAnim = position.x.interpolate({ inputRange: [-W / 2, 0, W / 2], outputRange: ['-10deg', '0deg', '10deg'] });
  const likeOpacity  = position.x.interpolate({ inputRange: [-W / 4, 0, W / 4], outputRange: [0, 0, 1] });
  const nopeOpacity  = position.x.interpolate({ inputRange: [-W / 4, 0, W / 4], outputRange: [1, 0, 0] });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('id, shoe_brand, shoe_model, size, foot_side, condition, price, photos, user_id')
      .eq('status', 'active')
      .limit(20)
      .order('created_at', { ascending: false });

    if (!data) { setLoading(false); return; }

    // Load seller names
    const userIds = [...new Set(data.map(l => l.user_id as string))];
    const { data: users } = await supabase
      .from('users')
      .select('id, name, location')
      .in('id', userIds);
    const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u]));

    const listings: Listing[] = data
      .filter(l => l.user_id !== userId)
      .map(l => ({
        id:               l.id,
        shoe_brand:       l.shoe_brand,
        shoe_model:       l.shoe_model,
        size:             l.size,
        foot_side:        l.foot_side,
        condition:        l.condition,
        price:            l.price,
        photos:           Array.isArray(l.photos) ? l.photos : [],
        seller_name:      userMap[l.user_id]?.name ?? 'Unknown',
        seller_location:  userMap[l.user_id]?.location ?? '',
      }));
    setListings(listings);
    setLoading(false);
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => { position.setValue({ x: g.dx, y: g.dy }); },
    onPanResponderRelease: (_, g) => {
      if (g.dx > 120) swipe('right');
      else if (g.dx < -120) swipe('left');
      else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  });

  function swipe(dir: 'left' | 'right') {
    const toX = dir === 'right' ? W + 100 : -W - 100;
    Animated.timing(position, { toValue: { x: toX, y: 0 }, duration: 300, useNativeDriver: false }).start(() => {
      if (dir === 'right') recordSwipe('right');
      position.setValue({ x: 0, y: 0 });
      setIndex(i => i + 1);
    });
  }

  async function recordSwipe(dir: string) {
    if (!userId || !current) return;
    await supabase.from('swipes').upsert({ swiper_id: userId, listing_id: current.id, direction: dir });
  }

  if (loading) {
    return (
      <SafeAreaView style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  const current = listings[index];

  if (!current) {
    return (
      <SafeAreaView style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 48, marginBottom: spacing.md }}>👟</Text>
        <Text style={s.emptyTitle}>You're all caught up</Text>
        <Text style={s.emptyBody}>No more listings to review right now.</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={() => { setIndex(0); loadListings(); }}>
          <ArrowLeftRight size={16} color={colors.accent} />
          <Text style={s.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const sideLabel = current.foot_side === 'L' ? 'Left' : current.foot_side === 'R' ? 'Right' : 'Either';
  const sideColor = current.foot_side === 'L' ? colors.leftShoe : current.foot_side === 'R' ? colors.rightShoe : colors.foregroundMuted;

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerLogo}>myother<Text style={{ color: colors.accent }}>pair</Text></Text>
        <Text style={s.headerSub}>Discover</Text>
      </View>

      {/* Stack preview */}
      {listings[index + 1] && (
        <View style={[s.card, s.cardBehind]} />
      )}

      {/* Main swipe card */}
      <Animated.View
        style={[s.card, {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: rotateAnim },
          ],
        }]}
        {...panResponder.panHandlers}
      >
        {/* LIKE / NOPE overlays */}
        <Animated.View style={[s.badge, s.badgeLike, { opacity: likeOpacity }]}>
          <Text style={s.badgeText}>MATCH</Text>
        </Animated.View>
        <Animated.View style={[s.badge, s.badgeNope, { opacity: nopeOpacity }]}>
          <Text style={[s.badgeText, { color: colors.destructive, borderColor: colors.destructive }]}>SKIP</Text>
        </Animated.View>

        {/* Photo */}
        <View style={s.photoWrap}>
          {current.photos[0]
            ? <Image source={{ uri: current.photos[0] }} style={s.photo} resizeMode="cover" />
            : <View style={[s.photo, s.photoPlaceholder]}><Text style={{ fontSize: 64 }}>👟</Text></View>
          }
        </View>

        {/* Info */}
        <View style={s.info}>
          <View style={s.infoTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.brand}>{current.shoe_brand}</Text>
              <Text style={s.model}>{current.shoe_model}</Text>
            </View>
            <Text style={s.price}>${current.price}</Text>
          </View>

          <View style={s.tags}>
            <View style={[s.tag, { borderColor: sideColor }]}>
              <Text style={[s.tagText, { color: sideColor }]}>{sideLabel}</Text>
            </View>
            <View style={s.tag}>
              <Text style={s.tagText}>UK {current.size}</Text>
            </View>
            <View style={s.tag}>
              <Text style={s.tagText}>{CONDITION_LABEL[current.condition] ?? current.condition}</Text>
            </View>
          </View>

          {current.seller_location ? (
            <View style={s.location}>
              <MapPin size={12} color={colors.foregroundMuted} />
              <Text style={s.locationText}>{current.seller_name} · {current.seller_location}</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {/* Action buttons */}
      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={() => swipe('left')} activeOpacity={0.8}>
          <X size={28} color={colors.destructive} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.actionBtnMatch]} onPress={() => swipe('right')} activeOpacity={0.8}>
          <Heart size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      <Text style={s.hint}>Swipe right to match · left to skip</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  header:        { width: '100%', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLogo:    { fontSize: font.md, fontWeight: '700', color: colors.foreground, letterSpacing: 1 },
  headerSub:     { fontSize: font.xs, color: colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
  card:          { width: CARD_W, borderRadius: radius['2xl'], backgroundColor: colors.card, overflow: 'hidden', position: 'absolute', top: 90, ...shadow.elevated, borderWidth: 1, borderColor: colors.border },
  cardBehind:    { top: 96, transform: [{ scale: 0.96 }], opacity: 0.6, zIndex: -1 },
  photoWrap:     { width: '100%', aspectRatio: 4 / 3 },
  photo:         { width: '100%', height: '100%' },
  photoPlaceholder: { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  info:          { padding: spacing.md },
  infoTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  brand:         { fontSize: font.xs, color: colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '600' },
  model:         { fontSize: font.xl, fontWeight: '700', color: colors.foreground, marginTop: 2 },
  price:         { fontSize: font['2xl'], fontWeight: '700', color: colors.foreground },
  tags:          { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: spacing.sm },
  tag:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  tagText:       { fontSize: font.xs, color: colors.foregroundMuted, fontWeight: '600' },
  location:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText:  { fontSize: font.xs, color: colors.foregroundMuted },
  badge:         { position: 'absolute', top: 20, zIndex: 10, borderWidth: 3, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  badgeLike:     { right: 20, borderColor: colors.matchGreen, transform: [{ rotate: '15deg' }] },
  badgeNope:     { left: 20, transform: [{ rotate: '-15deg' }] },
  badgeText:     { fontSize: 24, fontWeight: '900', color: colors.matchGreen, letterSpacing: 2 },
  actions:       { position: 'absolute', bottom: 100, flexDirection: 'row', gap: spacing.xl },
  actionBtn:     { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...shadow.card },
  actionBtnMatch:{ backgroundColor: colors.accent, borderColor: colors.accent },
  hint:          { position: 'absolute', bottom: 78, fontSize: font.xs, color: colors.foregroundMuted, letterSpacing: 0.5 },
  emptyTitle:    { fontSize: font.xl, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  emptyBody:     { fontSize: font.base, color: colors.foregroundMuted, marginBottom: spacing.lg, textAlign: 'center', paddingHorizontal: spacing.lg },
  refreshBtn:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  refreshBtnText:{ color: colors.accent, fontWeight: '600', fontSize: font.sm },
});
