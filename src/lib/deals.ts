export type Deal = {
  id: string;
  listingType: 'car' | 'tour';
  listingId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  buyerPhone?: string;
  sellerPhone?: string;
  channel: 'direct' | 'ridebhai';
  status: 'open' | 'pending' | 'success' | 'cancelled';
  title: string;
  price: number;
  fromCity?: string;
  toCity?: string;
  threadId?: string;
  adminNote?: string;
  createdAt: string;
  buyerRating?: number;
  sellerRating?: number;
};

export function mapDeal(row: any): Deal {
  return {
    id: row.id,
    listingType: row.listing_type === 'tour' ? 'tour' : 'car',
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    buyerName: row.buyer_name || 'Buyer',
    sellerName: row.seller_agency || row.seller_name || 'Seller',
    buyerPhone: row.buyer_phone || undefined,
    sellerPhone: row.seller_phone || undefined,
    channel: row.channel === 'ridebhai' ? 'ridebhai' : 'direct',
    status: (row.status as Deal['status']) || 'pending',
    title: row.title,
    price: Number(row.price || 0),
    fromCity: row.from_city || undefined,
    toCity: row.to_city || undefined,
    threadId: row.thread_id || undefined,
    adminNote: row.admin_note || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    buyerRating: row.buyer_rating != null ? Number(row.buyer_rating) : undefined,
    sellerRating: row.seller_rating != null ? Number(row.seller_rating) : undefined,
  };
}
