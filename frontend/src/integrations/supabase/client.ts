// Supabase implementation removed.
// A lightweight stub preserves the exported `supabase` symbol so the
// rest of the app can import it without pulling in `@supabase/supabase-js`.
// The stub returns empty results and no-op behaviors. Replace or
// implement your own backend integrations as needed.

type Result<T = any> = Promise<{ data: T | null; error: any | null }>;

class Chainable {
  private table: string | null = null;
  constructor(table?: string) {
    if (table) this.table = table;
  }

  from(table: string) {
    return new Chainable(table);
  }

  select(_qry?: any): any {
    // Return a thenable that resolves to an empty dataset
    const pr: any = Promise.resolve({ data: [], error: null });
    pr.eq = () => pr;
    pr.neq = () => pr;
    pr.maybeSingle = () => pr;
    pr.single = () => pr;
    pr.insert = async (_p: any) => ({ data: null, error: null });
    pr.update = async (_p: any) => ({ data: null, error: null });
    return pr;
  }

  async insert(_payload: any): Result {
    return { data: null, error: null };
  }

  async update(_payload: any): Result {
    return { data: null, error: null };
  }

  eq(_col: string, _val: any) {
    const pr: any = Promise.resolve({ data: [], error: null });
    pr.maybeSingle = () => pr;
    pr.single = () => pr;
    return pr;
  }

  // convenience chaining support
  then(onfulfilled: any, _onrejected?: any) {
    return Promise.resolve({ data: [], error: null }).then(onfulfilled);
  }
}

export const supabase = new Chainable() as any;

// Provide auth and functions namespaces expected by the app
supabase.auth = {
  async resetPasswordForEmail(_email: string, _opts?: any) {
    return { data: null, error: null };
  },
  async updateUser(_payload: any) {
    return { data: null, error: null };
  },
};

supabase.functions = {
  async invoke(_name: string, _opts?: any) {
    return { data: null, error: null };
  },
};

export default supabase;