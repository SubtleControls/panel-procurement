export type Panel = {
  id?: string;
  name: string;
  quantity?: number;
  currentStage?: string;
};

export type Project = {
  project_no: string;
  project_name: string;
  customer_name: string | null;
  current_stage: string | null;
  target_delivery: string | null;
  panels: Panel[] | null;
};

export type Bom = {
  id: string;
  project_no: string;
  panel_name: string;
  panel_qty: number;
  status: string;
  notes: string | null;
};

export type BomLine = {
  line_id: string;
  bom_id: string;
  sku: string;
  item_name: string;
  make: string | null;
  unit: string | null;
  qty_per_panel: number;
  total_required: number;
  stock_on_hand: number;
};

export type Shortage = {
  sku: string;
  item_name: string;
  make: string | null;
  unit: string | null;
  total_demand: number;
  stock_on_hand: number;
  balance: number;
  position: 'SHORT' | 'SUFFICIENT';
  project_count: number;
  projects: string | null;
  stock_synced_at: string | null;
};

export type Item = {
  sku: string;
  name: string;
  make: string | null;
  unit: string | null;
};
