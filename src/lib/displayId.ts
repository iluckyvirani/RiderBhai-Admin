/**
 * Ride Bhai human-readable tracking ID formatters.
 * Transforms UUIDs or backend display_ids into easy-to-read reference codes:
 * - Tours: RB-TR-1001
 * - Cars: RB-CR-1001
 * - Bookings/Deals: RB-BK-1001
 * - Users: RB-US-1001
 * - Drivers: RB-DR-1001
 * - Vehicles: RB-VH-1001
 */

export function formatTourId(id?: string, displayId?: string): string {
  if (displayId && displayId.trim()) return displayId.trim();
  if (!id) return 'RB-TR-1001';
  if (id.startsWith('RB-TR-')) return id;
  const hex = id.replace(/[^0-9a-fA-F]/g, '').slice(0, 4);
  const num = 1000 + (parseInt(hex || '1', 16) % 9000);
  return `RB-TR-${num}`;
}

export function formatCarId(id?: string, displayId?: string): string {
  if (displayId && displayId.trim()) return displayId.trim();
  if (!id) return 'RB-CR-1001';
  if (id.startsWith('RB-CR-')) return id;
  const hex = id.replace(/[^0-9a-fA-F]/g, '').slice(0, 4);
  const num = 1000 + (parseInt(hex || '1', 16) % 9000);
  return `RB-CR-${num}`;
}

export function formatBookingId(id?: string, displayId?: string): string {
  if (displayId && displayId.trim()) return displayId.trim();
  if (!id) return 'RB-BK-1001';
  if (id.startsWith('RB-BK-')) return id;
  const hex = id.replace(/[^0-9a-fA-F]/g, '').slice(0, 4);
  const num = 1000 + (parseInt(hex || '1', 16) % 9000);
  return `RB-BK-${num}`;
}

export function formatUserId(id?: string, displayId?: string): string {
  if (displayId && displayId.trim()) return displayId.trim();
  if (!id) return 'RB-US-1001';
  if (id.startsWith('RB-US-')) return id;
  const hex = id.replace(/[^0-9a-fA-F]/g, '').slice(0, 4);
  const num = 1000 + (parseInt(hex || '1', 16) % 9000);
  return `RB-US-${num}`;
}

export function formatDriverId(id?: string, displayId?: string): string {
  if (displayId && displayId.trim()) return displayId.trim();
  if (!id) return 'RB-DR-1001';
  if (id.startsWith('RB-DR-')) return id;
  const hex = id.replace(/[^0-9a-fA-F]/g, '').slice(0, 4);
  const num = 1000 + (parseInt(hex || '1', 16) % 9000);
  return `RB-DR-${num}`;
}

export function formatVehicleId(id?: string, displayId?: string): string {
  if (displayId && displayId.trim()) return displayId.trim();
  if (!id) return 'RB-VH-1001';
  if (id.startsWith('RB-VH-')) return id;
  const hex = id.replace(/[^0-9a-fA-F]/g, '').slice(0, 4);
  const num = 1000 + (parseInt(hex || '1', 16) % 9000);
  return `RB-VH-${num}`;
}

