import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export class TransactionsService {
    private supabase = createClient()

    async getTransactions(userId: string, filters?: {
        startDate?: string
        endDate?: string
        categoryId?: string
        budgetId?: string
        type?: 'income' | 'expense' | 'transfer'
        currency?: 'USD' | 'COP'
    }) {
        let query = this.supabase
            .from('transactions')
            .select(`
        *,
        category:categories(*),
        budget:budgets(*),
        account:accounts(*)
      `)
            .eq('user_id', userId)
            .order('date', { ascending: false })

        if (filters?.startDate) {
            query = query.gte('date', filters.startDate)
        }
        if (filters?.endDate) {
            query = query.lte('date', filters.endDate)
        }
        if (filters?.categoryId) {
            query = query.eq('category_id', filters.categoryId)
        }
        if (filters?.budgetId) {
            query = query.eq('budget_id', filters.budgetId)
        }
        if (filters?.type) {
            query = query.eq('type', filters.type)
        }
        if (filters?.currency) {
            query = query.eq('currency', filters.currency)
        }

        const { data, error } = await query

        if (error) throw error
        return data
    }

    async getTransaction(id: string) {
        const { data, error } = await this.supabase
            .from('transactions')
            .select(`
        *,
        category:categories(*),
        budget:budgets(*),
        account:accounts(*)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async createTransaction(transaction: TransactionInsert) {
        const { data, error } = await this.supabase
            .from('transactions')
            .insert(transaction)
            .select()
            .single()

        if (error) throw error

        // Update account balance
        await this.updateAccountBalance(transaction.account_id, transaction.amount, transaction.currency, transaction.type)

        return data
    }

    async updateTransaction(id: string, updates: TransactionUpdate) {
        const { data, error } = await this.supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async deleteTransaction(id: string) {
        // Get transaction details before deleting to update account balance
        const transaction = await this.getTransaction(id)

        const { error } = await this.supabase
            .from('transactions')
            .delete()
            .eq('id', id)

        if (error) throw error

        // Reverse the account balance update
        const reverseType = transaction.type === 'income' ? 'expense' : 'income'
        await this.updateAccountBalance(transaction.account_id, transaction.amount, transaction.currency, reverseType)

        return true
    }

    private async updateAccountBalance(accountId: string, amount: number, currency: 'USD' | 'COP', type: 'income' | 'expense' | 'transfer') {
        const { data: account } = await this.supabase
            .from('accounts')
            .select('balance_usd, balance_cop')
            .eq('id', accountId)
            .single()

        if (!account) return

        const multiplier = type === 'income' ? 1 : -1
        const updates: any = {}

        if (currency === 'USD') {
            updates.balance_usd = account.balance_usd + (amount * multiplier)
        } else {
            updates.balance_cop = account.balance_cop + (amount * multiplier)
        }

        await this.supabase
            .from('accounts')
            .update(updates)
            .eq('id', accountId)
    }

    async getStats(userId: string, startDate: string, endDate: string) {
        const { data: transactions } = await this.supabase
            .from('transactions')
            .select('type, amount, currency')
            .eq('user_id', userId)
            .gte('date', startDate)
            .lte('date', endDate)

        if (!transactions) return null

        const stats = {
            income_usd: 0,
            income_cop: 0,
            expense_usd: 0,
            expense_cop: 0,
            balance_usd: 0,
            balance_cop: 0,
        }

        transactions.forEach(t => {
            if (t.type === 'income') {
                if (t.currency === 'USD') stats.income_usd += t.amount
                else stats.income_cop += t.amount
            } else if (t.type === 'expense') {
                if (t.currency === 'USD') stats.expense_usd += t.amount
                else stats.expense_cop += t.amount
            }
        })

        stats.balance_usd = stats.income_usd - stats.expense_usd
        stats.balance_cop = stats.income_cop - stats.expense_cop

        return stats
    }
}

export const transactionsService = new TransactionsService()
