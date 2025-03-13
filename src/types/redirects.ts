
export interface RedirectRow {
  id: string;
  short_path: string;
  target_url: string;
  description: string | null;
  created_at: string;
  last_clicked_at: string | null;
  click_count: number;
}

export interface RedirectLogRow {
  id: string;
  redirect_id: string;
  clicked_at: string;
  user_agent: string | null;
  ip_address: string | null;
  referer: string | null;
}
