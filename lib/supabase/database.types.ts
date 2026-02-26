export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    currency_preference: 'USD' | 'COP'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    currency_preference?: 'USD' | 'COP'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    currency_preference?: 'USD' | 'COP'
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    type: 'income' | 'expense'
                    icon: string | null
                    color: string | null
                    is_default: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    type: 'income' | 'expense'
                    icon?: string | null
                    color?: string | null
                    is_default?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    type?: 'income' | 'expense'
                    icon?: string | null
                    color?: string | null
                    is_default?: boolean
                    created_at?: string
                }
            }
            accounts: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    type: 'cash' | 'bank' | 'credit_card' | 'savings'
                    balance_usd: number
                    balance_cop: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    type: 'cash' | 'bank' | 'credit_card' | 'savings'
                    balance_usd?: number
                    balance_cop?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    type?: 'cash' | 'bank' | 'credit_card' | 'savings'
                    balance_usd?: number
                    balance_cop?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            budgets: {
                Row: {
                    id: string
                    user_id: string
                    category_id: string
                    name: string
                    amount_usd: number
                    amount_cop: number
                    period: 'monthly' | 'weekly' | 'yearly'
                    start_date: string
                    end_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category_id: string
                    name: string
                    amount_usd?: number
                    amount_cop?: number
                    period: 'monthly' | 'weekly' | 'yearly'
                    start_date: string
                    end_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category_id?: string
                    name?: string
                    amount_usd?: number
                    amount_cop?: number
                    period?: 'monthly' | 'weekly' | 'yearly'
                    start_date?: string
                    end_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            transaction_items: {
                Row: {
                    id: string
                    transaction_id: string
                    name: string
                    quantity: number
                    unit_price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    name: string
                    quantity?: number
                    unit_price: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    name?: string
                    quantity?: number
                    unit_price?: number
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    account_id: string
                    category_id: string | null
                    budget_id: string | null
                    type: 'income' | 'expense' | 'transfer'
                    amount: number
                    currency: 'USD' | 'COP'
                    description: string
                    date: string
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    account_id: string
                    category_id?: string | null
                    budget_id?: string | null
                    type: 'income' | 'expense' | 'transfer'
                    amount: number
                    currency: 'USD' | 'COP'
                    description: string
                    date?: string
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    account_id?: string
                    category_id?: string | null
                    budget_id?: string | null
                    type?: 'income' | 'expense' | 'transfer'
                    amount?: number
                    currency?: 'USD' | 'COP'
                    description?: string
                    date?: string
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            budget_progress: {
                Row: {
                    budget_id: string
                    user_id: string
                    category_id: string
                    name: string
                    amount_usd: number
                    amount_cop: number
                    period: 'monthly' | 'weekly' | 'yearly'
                    start_date: string
                    end_date: string | null
                    spent_usd: number
                    spent_cop: number
                    percentage_usd: number
                    percentage_cop: number
                }
            }
        }
        Functions: {
            create_default_categories: {
                Args: { user_uuid: string }
                Returns: void
            }
        }
    }
}
