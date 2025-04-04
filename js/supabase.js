import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions for common operations
export const auth = {
    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })
        return { data, error }
    },

    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    },

    async signOut() {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession()
        return { data, error }
    }
}

export const products = {
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
        return { data, error }
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()
        return { data, error }
    }
}

export const cart = {
    async getCart(userId) {
        const { data, error } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', userId)
        return { data, error }
    },

    async addToCart(userId, productId, size, quantity) {
        const { data, error } = await supabase
            .from('cart')
            .upsert({
                user_id: userId,
                product_id: productId,
                size,
                quantity
            })
        return { data, error }
    },

    async updateQuantity(userId, productId, size, quantity) {
        const { data, error } = await supabase
            .from('cart')
            .update({ quantity })
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('size', size)
        return { data, error }
    },

    async removeFromCart(userId, productId, size) {
        const { data, error } = await supabase
            .from('cart')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('size', size)
        return { data, error }
    }
}

export const orders = {
    async createOrder(userId, items, shippingInfo) {
        const { data, error } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                items,
                shipping_info: shippingInfo,
                status: 'pending'
            })
        return { data, error }
    },

    async getOrders(userId) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
        return { data, error }
    }
} 