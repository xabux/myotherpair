import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, font, shadow } from '../../lib/theme';

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
  new_with_tags: 'New', new_without_tags: 'New',
  excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor',
};

export default function BrowseScreen() {
  const router = useRouter();
  const [listings,   setListings]   = useState<Listing[]>([]);
  const [filtered,   setFiltered]   = useState<Listing[]>([]);
  const [query,      setQuery]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadListings(); }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered(listings); return; }
    const q = query.toLowerCase();
    setFiltered(listings.filter(l =>
      l.shoe_brand.toLowerCase().includes(q) ||
      l.shoe_model.toLowerCase().includes(q) ||
      String(l.size).includes(q)
    ));
  }, [query, listings]);

  async function loadListings() {
    const { data } = await supabase
      .from('listings')
      .select('id, shoe_brand, shoe_model, size, foot_side, condition, price, photos, user_id')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!data) { setLoading(false); setRefreshing(false); return; }

    const userIds = [...new Set(data.map(l => l.user_id as string))];
    const { data: users } = await supabase
      .from('users').select('id, name, location').in('id', userIds);
    const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u]));

    const result: Listing[] = data.map(l => ({
      id:              l.id,
      shoe_brand:      l.shoe_brand,
      shoe_model:      l.shoe_model,
      size:            l.size,
      foot_side:       l.foot_side,
      condition:       l.condition,
      price:           l.price,
      photos:          Array.isArray(l.photos) ? l.photos : [],
      seller_name:     userMap[l.user_id]?.name,
      seller_location: userMap[l.user_id]?.location,
    }));
    setListings(result);
    setFiltered(result);
    setLoading(false);
    setRefreshing(false);
  }

  const onRefresh = useCallback(() => { setRefreshing(true); loadListings(); }, []);

  function ListingCard({ item }: { item: Listing }) {
    const sideColor = item.foot_side === 'L' ? colors.leftShoe : item.foot_side === 'R' ? colors.rightShoe : colors.foregroundMuted;
    const sideLabel = item.foot_side === 'L' ? 'L' : item.foot_side === 'R' ? 'R' : '±';
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => router.push(`/listing/${item.id}` as any)}
        activeOpacity={0.85}
      >
        <View style={s.photoWrap}>
          {item.photos[0]
            ? <Image source={{ uri: item.photos[0] }} style={s.photo} resizeMode="cover" />
            : <View style={[s.photo, s.photoPlaceholder]}><Text style={{ fontSize: 36 }}>👟</Text></View>
          }
          <View style={[s.sideTag, { backgroundColor: sideColor + '22', borderColor: sideColor }]}>
            <Text style={[s.sideTagText, { color: sideColor }]}>{sideLabel}</Text>
          </View>
        </View>
        <View style={s.cardBody}>
          <Text style={s.brandText}>{item.shoe_brand}</Text>
          <Text style={s.modelText} numberOfLines={1}>{item.shoe_model}</Text>
          <View style={s.cardMeta}>
            <Text style={s.sizeText}>UK {item.size}</Text>
            <Text style={s.condText}>{CONDITION_LABEL[item.condition] ?? item.condition}</Text>
          </View>
          <View style={s.cardFooter}>
            <Text style={s.priceText}>${item.price}</Text>
            {item.seller_location ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <MapPin size={10} color={colors.foregroundMuted} />
                <Text style={s.locationText} numberOfLines={1}>{item.seller_location}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Browse</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Search size={16} color={colors.foregroundMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Brand, model or size..."
            placeholderTextColor={colors.foregroundMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          <Text style={{ fontSize: 48, marginBottom: spacing.md }}>🔍</Text>
          <Text style={s.emptyTitle}>No listings found</Text>
          <Text style={s.emptyBody}>Try a different search or check back later.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing.sm, gap: spacing.sm }}
          renderItem={({ item }) => <ListingCard item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const CARD_W = (SCREEN_W - spacing.md * 2 - spacing.sm) / 2;

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: colors.background },
  header:          { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  headerTitle:     { fontSize: font.xl, fontWeight: '700', color: colors.foreground },
  searchWrap:      { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchBox:       { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44, borderWidth: 1, borderColor: colors.border },
  searchInput:     { flex: 1, fontSize: font.base, color: colors.foreground },
  card:            { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  photoWrap:       { aspectRatio: 1, position: 'relative' },
  photo:           { width: '100%', height: '100%' },
  photoPlaceholder:{ backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  sideTag:         { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sideTagText:     { fontSize: 10, fontWeight: '800' },
  cardBody:        { padding: spacing.sm },
  brandText:       { fontSize: 10, color: colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600' },
  modelText:       { fontSize: font.sm, fontWeight: '700', color: colors.foreground, marginTop: 1 },
  cardMeta:        { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  sizeText:        { fontSize: 10, color: colors.foregroundMuted, fontWeight: '500' },
  condText:        { fontSize: 10, color: colors.foregroundMuted },
  cardFooter:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  priceText:       { fontSize: font.md, fontWeight: '700', color: colors.accent },
  locationText:    { fontSize: 9, color: colors.foregroundMuted },
  emptyTitle:      { fontSize: font.lg, fontWeight: '700', color: colors.foreground, marginBottom: 8, textAlign: 'center' },
  emptyBody:       { fontSize: font.sm, color: colors.foregroundMuted, textAlign: 'center' },
});
